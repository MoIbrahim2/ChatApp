import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { error } from 'console';
import { Server, Socket } from 'socket.io';
import { ChatService } from 'src/chat/services/chat/chat.service';
import { MessageService } from 'src/message/services/message/message.service';
import { createClient } from 'redis';
import { RedisClientType } from '@redis/client';
@WebSocketGateway(3002, { cors: '*' })
export class ChattingGatway {
  private redisClient: RedisClientType;
  constructor(
    private chatService: ChatService,
    private messageService: MessageService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.redisClient = createClient({
      url: 'redis://localhost:6379', // Connection URL for Redis
    });
    this.redisClient.connect(); // Connect to Redis
  }
  @WebSocketServer() server: Server;
  // private sockets = new Map<string, string>();

  async handleDisconnect(@ConnectedSocket() client) {
    try {
      console.log(`Client disconnected: ${client.id}`);
      const userId = client['user'].userId;
      if (userId) {
        await this.cacheManager.del(`user:${userId}:socketId`);
        await this.cacheManager.set(`user:${userId}:status`, 'offline');
        console.log('Socket deleted successfully');
      }
    } catch (err) {
      console.log(error);
    }
  }

  @SubscribeMessage('on-connect')
  async onConnection(
    @ConnectedSocket() socket: Socket,
    @MessageBody() payload: { userId: string; name: string },
  ) {
    if (payload.userId) {
      socket['user'] = payload;
      await this.cacheManager.set(`user:${payload.userId}:socketId`, socket.id);
      await this.cacheManager.set(`user:${payload.userId}:status`, 'online');
      console.log('client connected');
    } else {
      this.server
        .to(socket.id)
        .emit('error-event', 'Error detected disconnecting...');
      socket.disconnect();
    }
  }
  @SubscribeMessage('send-message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { receiverId: string; content: string },
  ) {
    try {
      const { receiverId, content } = payload;
      const user = client['user'];
      const senderSocket = (await this.cacheManager.get(
        `user:${user.userId}:socketId`,
      )) as string;
      const receiverSocket = (await this.cacheManager.get(
        `user:${receiverId}:socketId`,
      )) as string;
      if (senderSocket === receiverSocket)
        throw new WsException(
          'The the sender socke is the same as the receiver socket ',
        );

      let chat = await this.chatService.findChat(user.userId, receiverId);
      if (!chat) {
        chat = await this.chatService.createChat(user.userId, receiverId);
      }

      // this.server.to(senderSocket).emit('new-message', {
      //   otherUserId: receiverId,
      //   userName: user.name,
      //   content,
      // });
      // If user is offline save the message into redis instead of sending it
      if (!receiverSocket) {
        await this.redisClient.lPush(
          `user:${receiverId}:undeliveredMessages`,
          JSON.stringify({
            otherUserId: user.userId,
            userName: user.name,
            content,
          }),
        );
      } else {
        this.server.to(receiverSocket).emit('new-message', {
          otherUserId: user.userId,
          userName: user.name,
          content,
        });
        // Don't save the message unless the receiver receive it
        await this.messageService.createMessage(
          chat.id,
          user.userId,
          content,
          user.name,
        );
      }
    } catch (err) {
      console.log(err);
    }
  }
}
