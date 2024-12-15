import { Module } from '@nestjs/common';
import { MessageController } from './controllers/message/message.controller';
import { MessageService } from './services/message/message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from 'src/entities/Message';
import { User } from 'src/entities/User';
import { JwtModule } from '@nestjs/jwt';
import { Chat } from 'src/entities/Chat';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, User, Chat]),
    JwtModule,
    ChatModule,
  ],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
