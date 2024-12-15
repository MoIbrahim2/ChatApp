import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from 'src/entities/Message';
import { Repository } from 'typeorm';
import { createClient, RedisClientType } from 'redis';
@Injectable()
export class MessageService {
  private redisClient: RedisClientType;
  constructor(
    @InjectRepository(Message) private messageRepository: Repository<Message>,
  ) {
    this.redisClient = createClient({
      url: 'redis://localhost:6379', // Connection URL for Redis
    });
    this.redisClient.connect(); // Connect to Redis
  }
  async createMessage(
    chatId: string,
    userId: string,
    content: string,
    senderName: string,
  ) {
    const message = this.messageRepository.create({
      chat: { id: chatId },
      sender: { id: userId },
      senderName,
      content,
    });
    await this.messageRepository.save(message);
    return {
      status: 'sucess',
      message: 'messages saved successfully',
    };
  }
  async findMessagesForUser(chatId: string, userId: string) {
    const messages = await this.messageRepository.find({
      where: { chat: { id: chatId }, sender: { id: userId } },
      select: ['content'],
    });
    if (!messages)
      throw new HttpException(
        'There is not messages for that user for specific chat',
        HttpStatus.NOT_FOUND,
      );
    return messages;
  }
  async checkForUndeliveredMessages(userId: string) {
    let messages = await this.redisClient.lRange(
      `user:${userId}:undeliveredMessages`,
      0,
      -1,
    );
    messages = messages.map((message) => JSON.parse(message));
    await this.redisClient.del(`user:${userId}:undeliveredMessages`);
    return messages;
  }
}
