import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthGuard } from 'src/auth/guards/auth/auth.guard';
import { ChatService } from 'src/chat/services/chat/chat.service';
import { CreateMessageDTO } from 'src/DTOs/createMessageDTO.dto';
import { Chat } from 'src/entities/Chat';

import { MessageService } from 'src/message/services/message/message.service';

@Controller('message')
export class MessageController {
  constructor(
    private messageService: MessageService,
    private chatService: ChatService,
  ) {}
  @UseGuards(AuthGuard)
  @Get('checkForUndeliveredMessages')
  async checkForUndeliveredMessages(@Req() req: Request) {
    return await this.messageService.checkForUndeliveredMessages(
      req['user'].id,
    );
  }

  @Get(':chatId/:userId')
  async getMessagesForUser(
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
  ) {
    return await this.messageService.findMessagesForUser(chatId, userId);
  }
  @Post('saveMessage')
  async saveMessage(@Body() createMessageDto: CreateMessageDTO) {
    let chatId;
    if (createMessageDto.receiverId && !createMessageDto.chatId) {
      chatId = (
        (await this.chatService.findChat(
          createMessageDto.senderId,
          createMessageDto.receiverId,
        )) as Chat
      ).id;
    }
    return this.messageService.createMessage(
      chatId,
      createMessageDto.senderId,
      createMessageDto.content,
      createMessageDto.senderName,
    );
  }
}
