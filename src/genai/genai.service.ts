import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { GoogleGenAI, Modality } from '@google/genai';
import { ConfigService } from '@nestjs/config';
import * as fs from 'node:fs';

import AudioBuffer from 'audio-buffer';
import * as audioBufferToWav from 'audiobuffer-to-wav';
import {
  MOOD_CONFIGS,
  SleepAnalysisReq,
  SleepAnalysisResponse,
} from './dto/genai.dto';
import { PrismaService } from 'src/auth/prisma.service';
import { sleepEntryDTO } from 'src/tracker/dto/tracker.dto';
import { McpService } from 'src/mcp/mcp.service';

@Injectable()
export class GenaiService {
  private genAI: GoogleGenAI;
  private logger = new Logger(GenaiService.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly mcp: McpService,
  ) {
    const apiKey: string = this.configService.getOrThrow('GEMINI_API_KEY');
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

  generateBinaural(mood: string, duration: number) {
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

  async analyzeSleep(
    sleepReq: SleepAnalysisReq,
    sleepData: sleepEntryDTO,
  ): Promise<SleepAnalysisResponse> {
    try {
      this.logger.log(`Analyzing sleep data for user: ${sleepReq.userId}`);
      const prompt = this.provideSleepPrompt(sleepData, sleepReq.date);
      const response = await this.genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          temperature: 0.3,
          responseMimeType: 'application/json',
        },
      });

      if (!response.text) {
        throw new Error('Empty response from Gemini API');
      }

      try {
        const parseJson = JSON.parse(response.text) as SleepAnalysisResponse;
        return {
          sleepScore: parseJson.sleepScore || 0,
          analysis: parseJson.analysis || 'Analysis not available',
          recommendations: Array.isArray(parseJson.recommendations)
            ? parseJson.recommendations
            : ['No recommendations available'],
          insight: {
            durationAnalysis:
              parseJson.insight?.durationAnalysis ||
              'Duration analysis not available',
            timingAnalysis:
              parseJson.insight?.timingAnalysis ||
              'Timing analysis not available',
            totalAnalysis:
              parseJson.insight?.totalAnalysis ||
              'Total analysis not available',
          },
        };
      } catch (parseError) {
        this.logger.error('Error parsing Gemini JSON response: ', parseError);

        return {
          sleepScore: 0,
          analysis: 'Unable to analyze sleep data at this time',
          recommendations: ['Please try again later'],
          insight: {
            durationAnalysis: 'Analysis unavailable',
            timingAnalysis: 'Analysis unavailable',
            totalAnalysis: 'Analysis unavailable',
          },
        };
      }
    } catch (error) {
      this.logger.error('Error analyzing sleep data with Gemini API:', error);
      throw new Error('Failed to analyze sleep data');
    }
  }

  private provideSleepPrompt(sleepData: sleepEntryDTO, date?: string) {
    return `You are a sleep analysis expert. Analyze the following sleep data and provide insights.

    Sleep Data:
    - User ID: ${sleepData.userId}
    - Bed Time: ${sleepData.bedTime}
    - Wake Time: ${sleepData.wakeTime}
    - Sleep Date: ${sleepData.sleepDate || date || 'Not specified'}
    - Reason/Notes: ${sleepData.reason || 'None provided'}

    Date: ${date || sleepData.sleepDate || 'Not specified'}

    Provide your analysis in this exact JSON structure:
    {
      "sleepScore": <number between 0-100>,
      "analysis": "<detailed analysis of the sleep quality based on bedtime, wake time, duration, and quality rating>",
      "recommendations": [
        "<recommendation 1>",
        "<recommendation 2>",
        "<recommendation 3>"
      ],
      "insight": {
        "durationAnalysis": "<analysis of sleep duration>",
        "timingAnalysis": "<analysis of bedtime and wake time patterns>",
        "totalAnalysis": "<overall sleep pattern analysis considering all factors>"
      }
    }

    Consider factors like:
    - Sleep duration (7-9 hours is typically optimal for adults)
    - Sleep timing (bedtime and wake time consistency)
    - Self-reported sleep quality rating
    - Any reasons or notes provided
    - Sleep hygiene recommendations

    Key Points: Each analysis should not be more than 50 words.
    Provide actionable insights and personalized recommendations based on the actual data provided.`;
  }

  async analyzeAndEmailSleep(
    userId: string,
    sleepData: sleepEntryDTO,
    to: string,
  ) {
    const analysis = await this.analyzeSleep(
      { userId, date: sleepData.sleepDate },
      sleepData,
    );

    const subject = `Your Sleep Report for ${sleepData.sleepDate}`;
    const body = `
 Hi there,

 Here’s your sleep analysis:

 Score: ${analysis.sleepScore}/100
 Summary: ${analysis.analysis}

 Recommendations:
 - ${analysis.recommendations.join('\n- ')}

 Insights:
 • Duration: ${analysis.insight.durationAnalysis}
 • Timing: ${analysis.insight.timingAnalysis}
 • Overall: ${analysis.insight.totalAnalysis}

 Stay well!
 `;

    return this.mcp.sendGmail(userId, to, subject, body);
  }
}
