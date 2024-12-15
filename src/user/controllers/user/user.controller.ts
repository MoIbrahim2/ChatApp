import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from 'src/auth/guards/auth/auth.guard';
import { UserService } from 'src/user/services/user/user.service';
@UsePipes(ValidationPipe)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @UseGuards(AuthGuard)
  @Get('all')
  async returnAllUsersExceptMe(@Req() req: Request) {
    return await this.userService.returnAllUsersExceptMe(req['user'].id);
  }
  @Post('testRedisSetter')
  async testReidsSetter(@Body() data) {
    return await this.userService.testReidsSetter(data);
  }
  @Get('testRedisGetter')
  async testReidsGetter() {
    return await this.userService.testRedisGetter();
  }
}
