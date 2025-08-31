import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
  Req,
  Res,
<<<<<<< HEAD
  StreamableFile,
  Param,
} from '@nestjs/common';
import { GenaiService } from './genai.service';

import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
=======
  UseGuards,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { GenaiService } from './genai.service';
import { SupabaseGuard } from 'src/auth/guards/auth.guard';
import { Response } from 'express';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
>>>>>>> 756a0064540bd6f2d30963ec383fbcbe094266b8

@Controller('genai')
export class GenaiController {
  private supabase: SupabaseClient;
  constructor(
    private readonly genAiService: GenaiService,
    private configService: ConfigService,
  ) {
<<<<<<< HEAD
    this.supabase = createClient(
      this.configService.getOrThrow<string>('SUPABASE_URL'),
      this.configService.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
    );
=======
    const supabaseUrl = this.configService.getOrThrow('SUPABASE_URL');
    const supabaseKey = this.configService.get('SUPABASE_SERVICE_ROLE_KEY');

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
>>>>>>> 756a0064540bd6f2d30963ec383fbcbe094266b8
  }

  @Post('generate-image')
  async generateImage(@Body() body: { prompt: string }) {
    return this.genAiService.GenerateImage(body.prompt);
  }

  @Get('binaural')
  getBinauralBeats(
    @Query('mood') mood: string,
    @Query('duration') duration: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const dur = parseInt(duration, 10) || 10; // default 10 sec

    // call service (should return a Buffer of WAV data)
    const wavBuffer = this.genAiService.generateBinaural(mood, dur);

    // set headers for download/streamsad
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Disposition', 'attachment; filename="binaural.wav"');
    res.send(wavBuffer); // wav is a Buffer or Uint8Array
  }

  @Get('binaural/:mood')
<<<<<<< HEAD
  async streamAudio(
    @Param('mood') mood: string,
  ): Promise<{ url: string; expiresAt: Date; mood: string }> {
    const filename = `${mood.trim()}.wav`;
    const expiresIn = 2 * 60 * 60;

    // 1. Create signed URL
    const { data, error } = await this.supabase.storage
      .from('binaural')
      .createSignedUrl(filename, expiresIn);

    if (error || !data?.signedUrl) {
      throw new NotFoundException(`File not found: ${filename}`);
    }

    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    return {
      url: data.signedUrl,
      expiresAt: expiresAt,
      mood: mood,
    };
=======
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
>>>>>>> 756a0064540bd6f2d30963ec383fbcbe094266b8
  }
}
