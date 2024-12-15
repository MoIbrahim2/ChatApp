import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
dotenv.config({
  path: '/Volumes/work/Projects/socket-chatting/config.env',
});
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://127.0.0.1:52714', // Allow only this origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allow these methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  });
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000, () =>
    console.log('The server is running'),
  );
}
bootstrap();
