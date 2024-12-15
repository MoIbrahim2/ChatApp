import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { WsException } from '@nestjs/websockets';
import { Request } from 'express';
import { Socket } from 'socket.io';

import { User } from 'src/entities/User';
import { Repository } from 'typeorm';

@Injectable()
export class AuthWebSocketGuard implements CanActivate {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<any> {
    const client = context.switchToWs().getClient<Socket>();
    let token;
    if (
      client.handshake.headers.authorization &&
      client.handshake.headers.authorization.startsWith('Bearer')
    ) {
      token = client.handshake.headers.authorization?.split(' ')[1];
    }
    if (!token) throw new WsException('You are not logged in, please login ');
    //Check if the JWT is correct

    let decoded;
    try {
      decoded = await this.jwtService.verifyAsync(token, {
        secret: 'this-is-my-secret',
      });
    } catch {
      throw new WsException('unauthorized JWT token');
    }
    //Check if the user actually still exists
    const user = await this.userRepository.findOneBy({ id: decoded.userId });
    if (!user) {
      throw new HttpException(
        'The user belonging to this token no longer exists. Please login again',
        HttpStatus.UNAUTHORIZED,
      );
    }

    client['user'] = user;
    return true;
  }
}
