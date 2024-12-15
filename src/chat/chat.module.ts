import { Module } from '@nestjs/common';
import { ChatController } from './controllers/chat/chat.controller';
import { ChatService } from './services/chat/chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chat } from 'src/entities/Chat';
import { User } from 'src/entities/User';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([User, Chat]), JwtModule],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
