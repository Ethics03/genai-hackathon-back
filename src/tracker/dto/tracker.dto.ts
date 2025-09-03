import {
  IsDateString,
  IsDecimal,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from '@nestjs/class-validator';

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
