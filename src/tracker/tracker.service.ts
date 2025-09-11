import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/auth/prisma.service';
import { moodEntryDTO, sleepEntryDTO } from './dto/tracker.dto';
import { Mood } from 'generated/prisma';

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

  async addMood(payload: moodEntryDTO): Promise<{ message: string }> {
    const user = await this.prisma.users.findUnique({
      where: { userId: payload.userId },
    });
    if (!user) {
      throw new NotFoundException('User not Found');
    }
    try {
      await this.prisma.moodEntry.create({
        data: {
          mood: payload.mood,
          userId: payload.userId,
          note: payload.note,
          date: payload.date,
        },
      });

      return { message: 'Mood details entered successfully' };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to enter mood details: ${error}`,
      );
    }
  }
}
