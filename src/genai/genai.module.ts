import { Module } from '@nestjs/common';
import { GenaiController } from './genai.controller';
import { GenaiService } from './genai.service';
import { PrismaService } from 'src/auth/prisma.service';
import { ConfigService } from '@nestjs/config';
import { SleepReportService } from './sleep-report.service';
import { GmailService } from 'src/email/gmail.service';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [GenaiController],
  providers: [
    GenaiService,
    PrismaService,
    ConfigService,
    SleepReportService,
    GmailService,
  ],
  exports: [GenaiService],
})
export class GenaiModule {}
