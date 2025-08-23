import {
  IsDate,
  IsDateString,
  IsDecimal,
  IsOptional,
  IsString,
  Min,
} from '@nestjs/class-validator';

export class sleepEntryDTO {
  @IsString()
  userId: string;

  @IsDateString()
  bedTime: string;

  @IsDateString()
  wakeTime: string;

  @IsOptional()
  @IsDateString()
  sleepDate: string;

  @IsOptional()
  @IsString()
  reason: string;

  @IsOptional()
  @IsDecimal()
  @Min(0)
  duration: number;
}
