import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/User';
import { Message } from './entities/Message';
import { Chat } from './entities/Chat';
import { ChatModule } from './chat/chat.module';
import { MessageModule } from './message/message.module';
import { ChattingGatway } from './webSocketGatway/chattingGatway';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { UserSubscriber } from './user/subscribers/userSubscriber';
import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import * as dotenv from 'dotenv';
dotenv.config({
  path: '/Volumes/work/Projects/socket-chatting/config.env',
});
@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => {
        const store = await redisStore({
          socket: {
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT, 10),
          },
        });
        return {
          store: store as unknown as CacheStore,
          ttl: 100 * 60000, // 3 minutes (milliseconds)
        };
      },
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '9d' },
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      subscribers: [UserSubscriber],
      entities: [User, Message, Chat],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([User]),
    UserModule,
    ChatModule,
    MessageModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, ChattingGatway],
  exports: [CacheModule],
})
export class AppModule {}
