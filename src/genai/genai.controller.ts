import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  Param,
  BadRequestException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { GenaiService } from './genai.service';
import { Response } from 'express';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { ConfigService } from '@nestjs/config';
import { SleepAnalysisReq, SleepAnalysisResponse } from './dto/genai.dto';
import { sleepEntryDTO } from 'src/tracker/dto/tracker.dto';

@Controller('genai')
export class GenaiController {
  private supabase: SupabaseClient;
  private logger = new Logger(GenaiController.name);
  constructor(
    private readonly genAiService: GenaiService,
    private configService: ConfigService,
  ) {
    const supabaseUrl: string = this.configService.getOrThrow('SUPABASE_URL');
    const supabaseKey = this.configService.getOrThrow('SUPABASE_SERVICE_ROLE_KEY');

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  @Post('generate-image')
  async generateImage(@Body() body: { prompt: string }) {
    return this.genAiService.GenerateImage(body.prompt);
  }

  @Get('binaural')
  getBinauralBeats(
    @Query('mood') mood: string,
    @Query('duration') duration: string,
    @Res() res: Response,
  ) {
    const dur = parseInt(duration, 10) || 10; // default 10 sec

    const wavBuffer = this.genAiService.generateBinaural(mood, dur);

    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Disposition', 'attachment; filename="binaural.wav"');
    res.send(wavBuffer); // wav is a Buffer or Uint8Array
  }

  @Get('binaural/:mood')
  async getBinauralAudioUrl(@Param('mood') mood: string) {
    try {
      if (!mood || typeof mood !== 'string') {
        throw new BadRequestException('Invalid mood parameter');
      }

      const expiresIn = 2 * 60 * 60; // 2 hours in seconds

      // TODO: Implement caching for signedUrl
      const { data, error } = await this.supabase.storage
        .from('binaural')
        .createSignedUrl(`${mood}.wav`, expiresIn);

      if (error || !data?.signedUrl)
        throw new Error(`Failed to create signed URL: ${error?.message}`);

      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      return {
        success: true,
        data: {
          audioUrl: data.signedUrl,
          expiresAt: expiresAt,
          mood: mood,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to get audio URL',
      };
    }
  }

  @Post('analyzesleep/:userId')
  async analyzeSleepByUserId(
    @Param('userId') userId: string,
    @Body() sleepData: sleepEntryDTO,
    @Query('date') date?: string,
  ): Promise<SleepAnalysisResponse> {
    try {
      this.logger.log(`Received sleep analysis request for user: ${userId}`);

      const sleepReq: SleepAnalysisReq = {
        userId,
        date,
      };

      return await this.genAiService.analyzeSleep(sleepReq, sleepData);
    } catch (error) {
      this.logger.error('Controller error:', error);
      throw new InternalServerErrorException('Failed to analyze sleep data');
    }
  }
}
