import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GenaiService } from './genai/genai.service';
import { GenaiModule } from './genai/genai.module';
import { ChatModule } from './chat/chat.module';
import { TrackerModule } from './tracker/tracker.module';
import { PrismaService } from './auth/prisma.service';
import { AuthModule } from './auth/auth.module';
import { McpModule } from './mcp/mcp.module';
import * as dotenv from 'dotenv';
import { McpService } from './mcp/mcp.service';
import { EmailService } from './email/email.service';
import { EmailModule } from './email/email.module';
dotenv.config();
@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    GenaiModule,
    ChatModule,
    TrackerModule,
    EmailModule,
    McpModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    GenaiService,
    PrismaService,
    McpService,
    EmailService,
  ],
})
export class AppModule {}
