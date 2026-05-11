import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { CreateRegisterInput } from '../../modules/auth/dto/register.input';

@Injectable()
export class UserBlock implements PipeTransform {
  private blocked = [
    'admin',
    'root',
    'system',
    'teacher',
    'student',
    'null',
    'undefined',
  ];

  transform(value: CreateRegisterInput) {
    const username = value.userName?.trim();

    if (!username) return value;

    if (this.blocked.includes(username.toLowerCase())) {
      throw new BadRequestException('Username is blocked');
    }

    return {
      ...value,
      userName: username,
    };
  }
}
