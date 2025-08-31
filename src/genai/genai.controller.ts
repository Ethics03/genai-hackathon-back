import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Query,
  Req,
  Res,
  StreamableFile,
  Param,
} from '@nestjs/common';
import { GenaiService } from './genai.service';

import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Controller('genai')
export class GenaiController {
  private supabase: SupabaseClient;
  constructor(
    private readonly genAiService: GenaiService,
    private configService: ConfigService,
  ) {
    this.supabase = createClient(
      this.configService.getOrThrow<string>('SUPABASE_URL'),
      this.configService.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY'),
    );
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
  }
}
