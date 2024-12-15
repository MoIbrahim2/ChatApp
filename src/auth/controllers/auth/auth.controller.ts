import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from 'src/auth/services/auth/auth.service';
import { CreateUserDTO } from 'src/DTOs/createUserDTO.dto';
import { LoginUserDto } from 'src/DTOs/loginUserDto.dto';
@UsePipes(ValidationPipe)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('signup')
  async signup(@Body() userData: CreateUserDTO) {
    return await this.authService.signup(userData);
  }
  @Post('login')
  async login(@Body() userData: LoginUserDto, @Res() res: Response) {
    return await this.authService.login(res, userData.email, userData.password);
  }
  @Get('validateToken')
  async validateToken(@Req() req: Request) {
    console.log('inside the validate token function');
    const token = req.cookies.jwt;
    return await this.authService.loginWithCookie(token);
  }
}
