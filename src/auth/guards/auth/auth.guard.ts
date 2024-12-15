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
import { Request } from 'express';

import { User } from 'src/entities/User';
import { Repository } from 'typeorm';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<any> {
    const req = context.switchToHttp().getRequest() as Request;
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token)
      throw new HttpException(
        'You are not logged in, please login ',
        HttpStatus.UNAUTHORIZED,
      );
    //Check if the JWT is correct
    let decoded;
    try {
      decoded = await this.jwtService.verifyAsync(token, {
        secret: 'this-is-my-secret',
      });
    } catch {
      throw new UnauthorizedException('unauthorized JWT token');
    }

    //Check if the user actually still exists
    const user = await this.userRepository.findOneBy({ id: decoded.userId });
    if (!user) {
      throw new HttpException(
        'The user belonging to this token no longer exists. Please login again',
        HttpStatus.UNAUTHORIZED,
      );
    }

    req['user'] = user;
    return true;
  }
}
