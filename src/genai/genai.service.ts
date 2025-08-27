import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { GoogleGenAI, Modality } from '@google/genai';
import { ConfigService } from '@nestjs/config';
import * as fs from 'node:fs';
import { NotFoundError } from 'rxjs';
import { BinauralBeatsRequest, BinauralBeatsResponse } from './dto/genai.dto';

@Injectable()
export class GenaiService {
  private genAI: GoogleGenAI;

  private readonly moodFrequencies = {
      relaxation: { base: 432, beat: 8, description: 'Alpha waves for deep relaxation', bpm: 60 },
      meditation: { base: 528, beat: 6, description: 'Theta waves for meditative state', bpm: 50 },
      focus: { base: 440, beat: 12, description: 'SMR waves for enhanced focus', bpm: 70 },
      sleep: { base: 396, beat: 3, description: 'Delta waves for deep sleep', bpm: 40 },
      energy: { base: 528, beat: 20, description: 'Beta waves for increased energy', bpm: 120 },
      anxiety: { base: 432, beat: 7, description: 'Alpha waves for anxiety relief', bpm: 65 },
      creativity: { base: 741, beat: 10, description: 'Alpha-Theta for creative flow', bpm: 80 },
      healing: { base: 528, beat: 4, description: 'Theta waves for healing', bpm: 45 },
      concentration: { base: 440, beat: 14, description: 'Beta waves for concentration', bpm: 85 },
      confidence: { base: 852, beat: 16, description: 'Beta waves for confidence building', bpm: 90 },
    };


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
      let genText = '';
      if (
        res.candidates &&
        res.candidates[0].content &&
        res.candidates[0].content.parts
      ) {
        for (const part of res.candidates[0].content.parts) {
          if (part.text) {
            genText = part.text;
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
        message: `${genText}`,
        image: imageData,
      };
    } catch (error) {
      return {
        message: `Couldn't generate image: ${error.message}`,
      };
    }
  }

  async generateBinaural(req: BinauralBeatsRequest): Promise<BinauralBeatsResponse>{
    try {
      const freqSettings = this.moodFrequencies[req.mood];
      if(!freqSettings) {
        throw new BadRequestException(`Invalid mood.`)
      }
      const prompt = `Generate ${req.sessionDuration} minutes of binaural beats audio:
        - Left Channel: ${freqSettings.base}
        - Right Channel: ${freqSettings.base + freqSettings.beat} Hz
        - Stereo WAV format
        - Smooth fade in/out

        The music should resonate with the mood of the person and to provide him the heal needed.`

      const res = this.genAI.models.generateContent({
        model: 'gemini'
      })
    }
  }


}
