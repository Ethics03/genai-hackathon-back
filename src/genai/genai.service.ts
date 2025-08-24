import { Injectable, NotFoundException } from '@nestjs/common';
import { GoogleGenAI, Modality } from '@google/genai';
import { ConfigService } from '@nestjs/config';
import * as fs from 'node:fs';
import { NotFoundError } from 'rxjs';
@Injectable()
export class GenaiService {
  private genAI: GoogleGenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow('GEMINI_API_KEY');
    this.genAI = new GoogleGenAI({ apiKey: apiKey });
  }

  async GenerateImage(prompt: string): Promise<any> {
    try {
      const res = await this.genAI.models.generateContent({
        model: 'gemini-2.0-flash-preview-image-generation',
        contents: prompt,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      });
      let imageData: string = '';
      if (
        res.candidates &&
        res.candidates[0].content &&
        res.candidates[0].content.parts
      ) {
        for (const part of res.candidates[0].content.parts) {
          if (part.text) {
            console.log(part.text);
          } else if (part.inlineData && part.inlineData.data) {
            imageData = part.inlineData.data;
            const buffer = Buffer.from(imageData, 'base64');
            fs.writeFileSync('gemini-native-image.png', buffer);
          }
        }
      }
      if (!imageData) {
        throw new NotFoundException('No image generated');
      }

      return {
        message: `prompt: ${prompt}`,
        image: imageData,
      };
    } catch (error) {
      return {
        message: `Couldn't generate image: ${error.message}`,
      };
    }
  }
}
