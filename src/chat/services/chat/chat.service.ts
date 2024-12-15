import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Chat } from 'src/entities/Chat';
import { User } from 'src/entities/User';
import { Repository } from 'typeorm';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private chatRepository: Repository<Chat>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}
  async createChat(id1: string, id2: string) {
    const user1 = await this.userRepository.findOneBy({ id: id1 });
    const user2 = await this.userRepository.findOneBy({ id: id2 });
    if (!(user1 && user2)) {
      throw new HttpException(
        'One of the users is not found, or maybe both',
        HttpStatus.NOT_FOUND,
      );
    }
    const chatName = `chats${id1 < id2 ? id1 + '_' + id2 : id2 + '_' + id1}`;

    const chat = this.chatRepository.create({
      chatName: chatName,
      participants: [{ id: user1.id }, { id: user2.id }],
    });
    const newChat = await this.chatRepository.save(chat);
    if (!chat)
      throw new HttpException(
        'Error in creating the chat',
        HttpStatus.METHOD_NOT_ALLOWED,
      );
    return newChat;
  }
  async findChat(id1: string, id2: string) {
    const user1 = await this.userRepository.findOneBy({ id: id1 });
    const user2 = await this.userRepository.findOneBy({ id: id2 });
    if (!(user1 && user2)) {
      throw new HttpException(
        'One of the users is not found, or maybe both',
        HttpStatus.NOT_FOUND,
      );
    }
    const chatName = `chats${id1 < id2 ? id1 + '_' + id2 : id2 + '_' + id1}`;
    const chat = await this.chatRepository.findOneBy({ chatName });

    if (!chat) return false;

    return chat;
  }

  async returnChatMessage(chatId: string) {
    const chat = this.chatRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.messages', 'messages')
      .where('chat.id = :chatId', { chatId })
      .orderBy('messages.createdAt', 'ASC')
      .select(['chat.chatName', 'messages'])
      .getOne();
    if (!(await chat)) {
      throw new HttpException('Chat ID not correct', HttpStatus.NOT_FOUND);
    }
    return (await chat).messages;
  }
  async returnChatMessageUsingUserIds(userId, receiverId) {
    let messages = [];
    const chat = (await this.findChat(userId, receiverId)) as any;
    if (!chat) {
      this.createChat(userId, receiverId);
      return messages;
    }
    messages = await this.returnChatMessage(chat.id);
    return messages;
  }
}
