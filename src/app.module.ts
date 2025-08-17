import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { GenaiService } from './genai/genai.service';
import { GenaiModule } from './genai/genai.module';
@Module({
  imports: [AuthModule, ConfigModule.forRoot({ isGlobal: true }), GenaiModule],
  controllers: [AppController],
  providers: [AppService, GenaiService],
})
export class AppModule {}
