import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { GenaiService } from './genai.service';
import { SupabaseGuard } from 'src/auth/guards/auth.guard';

@Controller('genai')
export class GenaiController {
  constructor(private readonly genAiService: GenaiService) {}

  @Post('generate-image')
  async generateImage(@Body() body: { prompt: string }) {
    return this.genAiService.GenerateImage(body.prompt);
  }
}
