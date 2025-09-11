import { Controller, Post, Body, UseGuards, Req, Logger } from '@nestjs/common';
import { GmailTokenService } from './gmail-token.service';
import { GmailService } from './gmail.service';
import { SupabaseGuard } from '../auth/guards/auth.guard';

@Controller('email')
@UseGuards(SupabaseGuard)
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(
    private readonly gmailTokenService: GmailTokenService,
    private readonly gmailService: GmailService,
  ) {}

  /**
   * Store Gmail tokens from frontend
   */
  @Post('store-tokens')
  async storeTokens(@Body() body: { tokens: any }, @Req() req: any) {
    const userId = req.user.id;

    await this.gmailTokenService.storeTokens(userId, body.tokens);

    this.logger.log(`Gmail tokens stored for user ${userId}`);

    return {
      success: true,
      message: 'Gmail tokens stored successfully',
    };
  }

  /**
   * Check if user has valid Gmail tokens
   */
  @Post('check-tokens')
  async checkTokens(@Req() req: any) {
    const userId = req.user.id;
    const hasValidTokens = await this.gmailService.hasValidTokens(userId);

    return {
      hasValidTokens,
      message: hasValidTokens
        ? 'Gmail access is ready'
        : 'Gmail access not authorized',
    };
  }

  /**
   * Send a test email
   */
  @Post('send-test')
  async sendTestEmail(@Req() req: any) {
    const userId = req.user.id;
    const userEmail = req.user.email;

    await this.gmailService.sendEmail(userId, {
      to: userEmail,
      from: userEmail,
      subject: 'Test Email from GenAI Platform',
      body: 'This is a test email sent from the GenAI platform to verify Gmail integration.',
      htmlBody: `
        <h2>Test Email</h2>
        <p>This is a test email sent from the <strong>GenAI platform</strong> to verify Gmail integration.</p>
        <p>If you received this email, your Gmail integration is working correctly!</p>
      `,
    });

    this.logger.log(`Test email sent to user ${userId} at ${userEmail}`);

    return {
      success: true,
      message: 'Test email sent successfully',
    };
  }
}
