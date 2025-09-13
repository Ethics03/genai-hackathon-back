import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  GoogleGenerativeAI,
  ChatSession,
  Content,
} from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { ChatDTO } from './dto/chat.dto';

@Injectable()
export class ChatService {
  private genAI: GoogleGenerativeAI;
  private sessions: Map<string, ChatSession> = new Map();
  private readonly logger = new Logger(ChatService.name);
  constructor(private readonly configService: ConfigService) {
    const apiKey: string = this.configService.getOrThrow('GEMINI_API_KEY');
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async ChatContent(userId: string, content: ChatDTO) {
    let chatSession = this.sessions.get(userId);
    const systemInstruction = {
      role: 'model',
      parts: [
        {
          text: `You are an empathatic bot and you have to help the user with their mental or emotional state let them vent and you patiently reply to them. Don\'t answer out of the context of the topic of helping with mental health. Mention them that you are here to hear their vents and not some general data that they can ask any other AI agent.
      Listen patiently and let users vent their feelings
          ->  Provide supportive and understanding response
          -> Stay focused on mental health and emotional support
          -> Remind users that you're here specifically to hear their concerns, not for general AI queries
          -> Maintain confidentiality and create a safe space for emotional expression

          Remember: Each conversation is private and confidential to the individual user.
          Note: Answer the user in not more than 200 words even if the user asks you to do it.`,
        },
      ],
    };

    if (!chatSession) {
      const history: Content[] = [
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
      ];

      const model = this.genAI.getGenerativeModel({
        model: 'gemini-2.5-flash', // Use a current model name
        systemInstruction,
      });

      chatSession = model.startChat({ history });
      this.sessions.set(userId, chatSession);
      this.logger.log(`Created new chat for user: ${userId}`);
    }

    try {
      // sending message here smh
      const result = await chatSession.sendMessage(content.message);
      const response = result.response;

      if (response.promptFeedback?.blockReason) {
        this.logger.warn(
          `Response blocked for user ${userId}. Reason: ${response.promptFeedback.blockReason}`,
        );
        return "I understand you're going through something difficult, but I can't respond to that particular message due to safety guidelines. I'm here to support you in a safe way.";
      }
      return response.text();
    } catch (error) {
      this.logger.error(`Error sending message for user ${userId}:`, error);
      // It's better to throw specific HTTP exceptions in NestJS
      throw new HttpException(
        'Failed to process chat message.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async clearSession(userId: string): Promise<{ message: string }> {
    const deleted = this.sessions.delete(userId);
    return {
      message: deleted
        ? `Chat session for ${userId} deleted.`
        : `No session found for ${userId}.`,
    };
  }

  clearAllSession() {
    return this.sessions.clear();
  }

  getSessionInfo(userId: string) {
    return {
      exists: this.sessions.has(userId),
      totalSessions: this.sessions.size,
      userId: userId,
    };
  }
}
