import { Module } from '@nestjs/common';
import { GenaiController } from './genai.controller';
import { GenaiService } from './genai.service';
import { PrismaService } from 'src/auth/prisma.service';

@Module({
  controllers: [GenaiController],
  providers: [GenaiService, PrismaService],
})
export class GenaiModule {}
