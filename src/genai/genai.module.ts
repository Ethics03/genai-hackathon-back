import { Module } from '@nestjs/common';
import { GenaiController } from './genai.controller';
import { GenaiService } from './genai.service';

@Module({
  controllers: [GenaiController],
  providers: [GenaiService],
})
export class GenaiModule {}
