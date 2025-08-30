import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GoogleGenAI, Modality } from '@google/genai';
import { ConfigService } from '@nestjs/config';
import * as fs from 'node:fs';
import { NotFoundError } from 'rxjs';
import { BinauralBeatsRequest, BinauralBeatsResponse, SleepAnalysisReq } from './dto/genai.dto';
import AudioBuffer from 'audio-buffer';
import * as audioBufferToWav from 'audiobuffer-to-wav';
import { MOOD_CONFIGS, MoodConfig } from './dto/genai.dto';
import { PrismaService } from 'src/auth/prisma.service';

@Injectable()
export class GenaiService {
  private genAI: GoogleGenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {
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

  async generateBinaural(mood: string, duration: number) {
    const config = MOOD_CONFIGS[mood];
    if (!config) {
      throw new BadRequestException(`Invalid mood: ${mood}`);
    }

    const { carrier, beat } = config;
    // accepted value
    const sampleRate = 44100;
    const length = sampleRate * duration;

    const buffer = new AudioBuffer({
      length,
      numberOfChannels: 2,
      sampleRate,
    });

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      const freq = channel === 0 ? carrier : carrier + beat; // Left = base, Right = base+beat
      for (let i = 0; i < length; i++) {
        // gain is basically for volume increase or decrease -> 0.1 for now as without it my brain went boom
        const gain = 0.1;
        data[i] = Math.sin(2 * Math.PI * freq * (i / sampleRate)) * gain;
      }
    }
    //return the audio in .wav format
    const wav = audioBufferToWav(buffer);
    return Buffer.from(wav);
  }
 
}
