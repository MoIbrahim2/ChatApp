import { Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/guards/auth/auth.guard';
import { ChatService } from 'src/chat/services/chat/chat.service';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}
  @Post('create/:id1/:id2')
  async createChat(@Param('id1') id1: string, @Param('id2') id2: string) {
    return await this.chatService.createChat(id1, id2);
  }
  @Get('find/:id1/:id2')
  async findChat(@Param('id1') id1: string, @Param('id2') id2: string) {
    return await this.chatService.findChat(id1, id2);
  }
  // @Get('chatMessages/:chatId')
  // async returnChatMessages(@Param('chatId') id: string) {
  //   return await this.chatService.returnChatMessage(id);
  // }
  @UseGuards(AuthGuard)
  @Get('chatMessages/:receiverId')
  async returnChatMessagesUsingIds(
    @Req() req: Request,
    @Param('receiverId') receiverId: string,
  ) {
    return await this.chatService.returnChatMessageUsingUserIds(
      req['user'].id,
      receiverId,
    );
  }
}
