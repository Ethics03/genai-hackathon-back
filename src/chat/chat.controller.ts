import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatDTO } from './dto/chat.dto';
@Controller('chat')
export class ChatController {
  constructor(private readonly chatservice: ChatService) {}
  @Post('chatsession/:userId')
  async chatSession(@Param('userId') userId: string, @Body() body: ChatDTO) {
    return this.chatservice.ChatContent(userId, body);
  }

  @Delete('delete/:userId')
  async clearUserSession(@Param('userId') userId: string) {
    return await this.chatservice.clearSession(userId);
  }
}
