import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GenaiService {
  private genAI: GoogleGenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow('GEMINI_API_KEY');
    this.genAI = new GoogleGenAI({ apiKey: apiKey });
  }

  async generateContent() {
    const res = this.genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Explain how cool Nestjs IS',
    });
    console.log(res);
    return res;
  }
}
