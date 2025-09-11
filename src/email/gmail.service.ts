import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GmailTokenService } from './gmail-token.service';
import { google } from 'googleapis';

export interface EmailData {
  to: string;
  from: string;
  subject: string;
  body: string;
  htmlBody?: string;
}

@Injectable()
export class GmailService {
  private readonly logger = new Logger(GmailService.name);
  private readonly oauth2Client: any;

  constructor(
    private readonly configService: ConfigService,
    private readonly gmailTokenService: GmailTokenService,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      this.configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      this.configService.getOrThrow<string>('GOOGLE_REDIRECT_URI'),
    );
  }

  /**
   * Send email using Gmail API with encrypted tokens
   */
  async sendEmail(userId: string, emailData: EmailData): Promise<void> {
    try {
      const tokens = await this.gmailTokenService.getValidTokens(userId);

      this.oauth2Client.setCredentials({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });

      const gmail = google.gmail({ version: 'v1', auth: this.oauth2Client });

      // Create the email message
      const message = this.createEmailMessage(emailData);

      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: message,
        },
      });

      this.logger.log(
        `Email sent successfully for user ${userId}. Message ID: ${response.data.id}`,
      );
    } catch (error) {
      this.logger.error(`Failed to send email for user ${userId}:`, error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Create a properly formatted email message for Gmail API
   */
  private createEmailMessage(emailData: EmailData): string {
    const { to, from, subject, body, htmlBody } = emailData;

    const boundary = '----=_Part_' + Math.random().toString(36).substr(2, 9);

    let message = [
      `To: ${to}`,
      `From: ${from}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: 7bit',
      '',
      body,
    ];

    if (htmlBody) {
      message.push(
        '',
        `--${boundary}`,
        'Content-Type: text/html; charset=UTF-8',
        'Content-Transfer-Encoding: 7bit',
        '',
        htmlBody,
      );
    }

    message.push(`--${boundary}--`);

    return Buffer.from(message.join('\n'))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * Check if user has valid Gmail tokens
   */
  async hasValidTokens(userId: string): Promise<boolean> {
    return await this.gmailTokenService.hasValidTokens(userId);
  }

  /**
   * Store Gmail tokens from frontend
   */
  async storeTokens(userId: string, tokens: any): Promise<void> {
    await this.gmailTokenService.storeTokens(userId, tokens);
  }
}
