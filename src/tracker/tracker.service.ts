import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/auth/prisma.service';
import { sleepEntryDTO } from './dto/tracker.dto';
import { StyleReferenceImage } from '@google/genai';

@Injectable()
export class TrackerService {
  constructor(private readonly prisma: PrismaService) {}

  async sleepDetails(payload: sleepEntryDTO): Promise<{ message: string }> {
    const user = await this.prisma.users.findUnique({
      where: { userId: payload.userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    try {
      await this.prisma.sleepEntry.create({
        data: {
          userId: payload.userId,
          bedTime: new Date(payload.bedTime),
          wakeTime: new Date(payload.wakeTime),
          duration: payload.duration,
          reason: payload.reason,
          sleepDate: payload.sleepDate,
        },
      });

      return { message: 'Sleep Details created successfully' };
    } catch (error) {
      throw new ConflictException(
        'Sleep entry already exists for this date or failed to create.',
      );
    }
  }
}
