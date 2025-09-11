import { IsOptional, IsString } from '@nestjs/class-validator';
import { Mood } from 'generated/prisma';

export class sleepEntryDTO {
  @IsString()
  userId: string;

  @IsString()
  bedTime: string;

  @IsString()
  wakeTime: string;

  @IsOptional()
  @IsString()
  sleepDate: string;

  @IsOptional()
  @IsString()
  reason: string;
}

export class moodEntryDTO {
  @IsString()
  userId: string;

  @IsString()
  mood: Mood;

  @IsString()
  note: string;

  @IsString()
  date: string;
}
