import { Injectable } from '@nestjs/common';
import { UserService } from './user/user.service';

@Injectable()
export class AppService {
  constructor(private userService: UserService) {}
  getHello(): string {
    return 'Hello World!';
  }
}
