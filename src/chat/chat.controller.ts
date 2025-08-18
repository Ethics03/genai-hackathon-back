import { Body, Controller, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatDTO, MessageDTO } from './dto/chat.dto';
@Controller('chat')
export class ChatController {
  constructor(private readonly chatservice: ChatService) {}
  @Post('chatsession')
  async chatSession(@Body() body: ChatDTO) {
    return this.chatservice.ChatContent(body);
  }
}
