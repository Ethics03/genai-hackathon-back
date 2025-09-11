import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';
import { ChatDTO } from './dto/chat.dto';
import { spawn } from 'child_process';
@Injectable()
export class ChatService {
  private genAI: GoogleGenAI;
  private sessions: Map<string, any> = new Map();
  private readonly logger = new Logger(ChatService.name);
  constructor(private readonly configService: ConfigService) {
    const apiKey: string = this.configService.getOrThrow('GEMINI_API_KEY');
    this.genAI = new GoogleGenAI({ apiKey: apiKey });
  }

  async ChatContent(userId: string, content: ChatDTO) {
    let chat = this.sessions.get(userId);
    const prompt = `You are an empathatic bot and you have to help the user with their mental or emotional state let them vent and you patiently reply to them. Don\'t answer out of the context of the topic of helping with mental health. Mention them that you are here to hear their vents and not some general data that they can ask any other AI agent.
      Listen patiently and let users vent their feelings
          ->  Provide supportive and understanding response
          -> Stay focused on mental health and emotional support
          -> Remind users that you're here specifically to hear their concerns, not for general AI queries
          -> Maintain confidentiality and create a safe space for emotional expression

          Remember: Each conversation is private and confidential to the individual user.
          Note: Answer the user in not more than 200 words even if the user asks you to do it.`;
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
      this.sessions.set(userId, chat);
      console.log(`Created new chat session for user: ${userId}`);
    }

    try {
      // sending message here smh
      const response = await chat.sendMessage({
        message: content.message,
      });

      return response.text;
    } catch (error) {
      this.logger.error('Error sending message:', error);
      if (error.message?.includes('SAFETY')) {
        return "I understand you're going through something difficult, but I can't respond to that particular message due to safety guidelines. Please feel free to rephrase or share something else that's on your mind. I'm here to support you in a safe way.";
      } else if (error.message?.includes('QUOTA_EXCEEDED')) {
        return "I'm experiencing high demand right now. Please try again in a few minutes. I'm here when you're ready to continue our conversation.";
      }

      throw new Error('Failed to process chat message');
    }
  }
  clearSession(userId: string): boolean {
    return this.sessions.delete(userId);
  }

  getSessionInfo(userId: string) {
    return {
      exists: this.sessions.has(userId),
      totalSessions: this.sessions.size,
      userId: userId,
    };
  }

  async callMcpTool(method: string, params: any) {
    return new Promise((resolve, reject) => {
      const mcp = spawn('node', ['path/to/mcp.js']); // or path to your MCP executable

      const request = {
        jsonrpc: '2.0',
        method: method,
        params: params,
        id: 1,
      };

      mcp.stdin.write(JSON.stringify(request) + '\n');

      let dataBuffer = '';
      mcp.stdout.on('data', (data) => {
        dataBuffer += data.toString();
        try {
          const parsed = JSON.parse(dataBuffer);
          if (parsed.id === 1) {
            resolve(parsed.result);
            mcp.kill();
          }
        } catch (e) {
          // wait for complete JSON
        }
      });

      mcp.stderr.on('data', (err) => {
        reject(err.toString());
        mcp.kill();
      });
    });
  }
}
