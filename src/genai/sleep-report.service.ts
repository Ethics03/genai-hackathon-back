import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../auth/prisma.service';
import { GmailService } from '../email/gmail.service';
import { GenaiService } from '../genai/genai.service';

@Injectable()
export class SleepReportService {
  private readonly logger = new Logger(SleepReportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gmailService: GmailService,
    private readonly genaiService: GenaiService,
  ) {}

  async sendReport(userId: string, date?: string) {
    // 1. Get user (use findFirst if userId is not unique in schema)
    const user = await this.prisma.users.findFirst({
      where: { userId },
      select: { name: true, email: true },
    });
    if (!user) throw new Error('User not found');

    // 2. Normalize date range to UTC day
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

    // 3. Fetch sleep entry
    const sleepEntry = await this.prisma.sleepEntry.findFirst({
      where: {
        userId,
        sleepDate: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    if (!sleepEntry) {
      this.logger.warn(
        `No sleep data found for userId=${userId} date=${targetDate.toISOString()}`,
      );
      throw new Error('No sleep data for that date');
    }

    // 4. AI analysis
    const analysis = await this.genaiService.analyzeSleep(
      { userId, date: targetDate.toISOString() },
      {
        userId,
        bedTime: sleepEntry.bedTime.toISOString(),
        wakeTime: sleepEntry.wakeTime.toISOString(),
        reason: sleepEntry.reason,
        sleepDate: sleepEntry.sleepDate.toISOString(),
      },
    );

    // 5. Build email
    const subject = `Your AI Sleep Report - ${targetDate.toLocaleDateString()}`;
    const body = `
Hello ${user.name},

Here’s your AI-powered sleep report for ${targetDate.toDateString()}:

• Duration: ${analysis.insight.durationAnalysis}
• Timing: ${analysis.insight.timingAnalysis}
• Overall: ${analysis.insight.totalAnalysis}

Recommendations:
${analysis.recommendations.map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}

Best,
Your Sleep AI
    `;

    const htmlBody = `
      <h2>🌙 AI Sleep Report for ${targetDate.toDateString()}</h2>
      <p>Hello <b>${user.name}</b>,</p>
      <p><b>Duration:</b> ${analysis.insight.durationAnalysis}</p>
      <p><b>Timing:</b> ${analysis.insight.timingAnalysis}</p>
      <p><b>Overall:</b> ${analysis.insight.totalAnalysis}</p>
      <h3>Recommendations:</h3>
      <ul>
        ${analysis.recommendations.map((r: string) => `<li>${r}</li>`).join('')}
      </ul>
    `;

    // 6. Send email
    await this.gmailService.sendEmail(userId, {
      to: user.email,
      from: user.email,
      subject,
      body,
      htmlBody,
    });

    this.logger.log(`Sleep report sent to ${user.email}`);
    return { success: true, message: `Report sent to ${user.email}` };
  }
}
