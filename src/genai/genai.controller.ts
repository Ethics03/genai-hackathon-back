import { Controller, Get } from '@nestjs/common';
import { GenaiService } from './genai.service';

@Controller('genai')
export class GenaiController {
  constructor(private readonly genAiService: GenaiService) {}
  @Get('testgemini')
  async generateContent() {
    return this.genAiService.generateContent();
  }
}
