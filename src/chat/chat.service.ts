import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';
import { ChatDTO, MessageDTO } from './dto/chat.dto';

@Injectable()
export class ChatService {
  private genAI: GoogleGenAI;
  private sessions: Map<string, any> = new Map();

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.getOrThrow('GEMINI_API_KEY');
    this.genAI = new GoogleGenAI({ apiKey: apiKey });
  }

  async ChatContent(content: ChatDTO) {
    let chat = this.sessions.get(content.userId);
    const prompt =
      'You are an empathatic bot and you have to help the user with their mental or emotional state let them vent and you patiently reply to them.';
    if (!chat) {
      chat = this.genAI.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: prompt,
        },
        history: [
          {
            role: 'user',
            parts: [{ text: 'Hello' }],
          },
          {
            role: 'model',
            parts: [
              {
                text: "Hello! I'm here to listen and support you. Please feel free to share what's on your mind. I'm here to help you",
              },
            ],
          },
        ],
      });
      this.sessions.set(content.userId, chat);
    }

    try {
      // sending message here smh
      const response = await chat.sendMessage({
        message: content.message,
      });

      return response.text;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to process chat message');
    }
  }
  clearSession(userId: string): boolean {
    return this.sessions.delete(userId);
  }
  
  
}
