import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { CookieOptions, Response } from 'express';
import { CreateUserDTO } from 'src/DTOs/createUserDTO.dto';
import { User } from 'src/entities/User';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}
  async signup(createUserData: CreateUserDTO) {
    try {
      const user = this.userRepository.create(createUserData);
      const newUser = await this.userRepository.save(user);

      if (!newUser)
        throw new HttpException("Can't create user", HttpStatus.BAD_REQUEST);

      const token = await this.jwtService.signAsync({
        userId: newUser.id,
      });

      const { password, ...docWithoutPassword } = newUser;

      return {
        status: 'sucess',
        message: 'successfully created',
        data: { token, ...docWithoutPassword },
      };
    } catch (err) {
      err.status = err.status ? err.status : 500;
      return {
        status: 'fail',
        message: err.message,
      };
    }
  }

  async login(res: Response, email: string, password: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { email },
        select: ['id', 'password', 'name'],
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new HttpException(
          'Invalid email or Wrong password',
          HttpStatus.UNAUTHORIZED,
        );
      }
      const token = await this.jwtService.signAsync({
        userId: user.id,
      });
      const cookieOptions: CookieOptions = {
        expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        httpOnly: false,
      };
      res.cookie('jwt', token, cookieOptions);

      res.status(201).json({ status: 'success', token, name: user.name });
    } catch (err) {
      res.status(err.status).json({
        status: 'fail',
        message: err.message,
      });
    }
  }
  async loginWithCookie(token) {
    if (!token)
      throw new HttpException('Not authenticated', HttpStatus.UNAUTHORIZED);
    let decoded;
    try {
      decoded = await this.jwtService.verifyAsync(token, {
        secret: 'this-is-my-secret',
      });
    } catch {
      throw new HttpException(
        'unauthorized JWT token',
        HttpStatus.UNAUTHORIZED,
      );
    }
    //Check if the user actually still exists
    const user = await this.userRepository.findOneBy({ id: decoded.userId });
    if (!user) {
      throw new HttpException(
        'The user belonging to this token no longer exists. Please login again',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return { status: 'success', name: user.name };
  }
}
