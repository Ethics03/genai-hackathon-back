import { Module } from '@nestjs/common';
import { TrackerService } from './tracker.service';
import { TrackerController } from './tracker.controller';
import { PrismaService } from 'src/auth/prisma.service';

@Module({
  providers: [TrackerService, PrismaService],
  controllers: [TrackerController],
})
export class TrackerModule {}
