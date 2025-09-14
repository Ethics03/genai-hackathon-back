import { IsString } from 'class-validator';

export class MessageDTO {
  public message: string;
}

export class ChatDTO {
  @IsString()
  message: string;
}
