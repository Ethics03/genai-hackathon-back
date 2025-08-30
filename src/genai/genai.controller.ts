import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { GenaiService } from './genai.service';
import { SupabaseGuard } from 'src/auth/guards/auth.guard';
import { Response } from 'express';

@Controller('genai')
export class GenaiController {
  constructor(private readonly genAiService: GenaiService) {}

  @Post('generate-image')
  async generateImage(@Body() body: { prompt: string }) {
    return this.genAiService.GenerateImage(body.prompt);
  }

  @Get('binaural')
  async getBinauralBeats(
    @Query('mood') mood: string,
    @Query('duration') duration: string,
    @Res() res: Response,
  ) {
    const dur = parseInt(duration, 10) || 10; // default 10 sec

    // call service (should return a Buffer of WAV data)
    const wavBuffer = await this.genAiService.generateBinaural(mood, dur);

    // set headers for download/stream
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Disposition', 'attachment; filename="binaural.wav"');
    res.send(wavBuffer); // wav is a Buffer or Uint8Array
  }
}
