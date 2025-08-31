import { Module } from '@nestjs/common';
import { GenaiController } from './genai.controller';
import { GenaiService } from './genai.service';
import { PrismaService } from 'src/auth/prisma.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [GenaiController],
  providers: [GenaiService, PrismaService, ConfigService],
})
export class GenaiModule {}
