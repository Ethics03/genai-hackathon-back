import { IsEmail, IsNotEmpty, IsString } from '@nestjs/class-validator';

export class createProfileDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  bio: string;
}
