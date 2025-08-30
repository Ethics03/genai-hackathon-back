import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { GenaiService } from './genai/genai.service';
import { GenaiModule } from './genai/genai.module';
import { ChatModule } from './chat/chat.module';
import { TrackerModule } from './tracker/tracker.module';
import { PrismaService } from './auth/prisma.service';
@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({ isGlobal: true }),
    GenaiModule,
    ChatModule,
    TrackerModule,
  ],
  controllers: [AppController],
  providers: [AppService, GenaiService, PrismaService],
})
export class AppModule {}
