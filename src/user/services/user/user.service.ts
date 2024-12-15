import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/User';
import { Not, Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async createUser(name: string) {
    const user = this.userRepository.create({ name });
    const newUser = await this.userRepository.save(user);
    return newUser;
  }
  async findUser(id: string) {
    const user = this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new HttpException(
        'There is no user with this specific ID',
        HttpStatus.NOT_FOUND,
      );
    }
    return true;
  }
  async returnAllUsersExceptMe(excludedUserId) {
    const users = await this.userRepository.find({
      where: { id: Not(excludedUserId) },
    });
    return users;
  }
  async testReidsSetter(data) {
    const result = await this.cacheManager.set('test', JSON.stringify(data));
    return result;
  }
  async testRedisGetter() {
    const data = await this.cacheManager.get('test');
    if (!data) throw Error;
    return data;
  }
}
