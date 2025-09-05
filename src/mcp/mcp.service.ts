import { Injectable, Logger } from '@nestjs/common';

import { Composio } from '@composio/core';
@Injectable()
export class McpService {
  private composio: Composio;
  private logger = new Logger(McpService.name);
  constructor() {
    this.composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY,
    });
  }

  async sendGmail(userId: string, to: string, subject: string, body: string) {
    try {
      const result = await this.composio.tools.execute('GMAIL_SEND_EMAIL', {
        userId,
        arguments: {
          recipient_email: to,
          subject,
          body,
        },
      });
      return result;
    } catch (error) {
      this.logger.error('Error sending Gmail:', error);
      throw new Error('Failed to send email');
    }
  }
}
