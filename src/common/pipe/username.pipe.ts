import {
  Injectable,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDoc } from '../../modules/users/users.schema';

@Injectable()
export class UsernamePipe implements PipeTransform {
  constructor(
    @InjectModel('User')
    private readonly userModel: Model<UserDoc>,
  ) { }

  async transform(value: any) {
    if (typeof value !== 'string') {
      throw new BadRequestException('Invalid username');
    }

    const username = value.trim();

    if (!username) {
      throw new BadRequestException('Username required');
    }

    if (username.length < 5 || username.length > 20) {
      throw new BadRequestException('Username must be 5-20 chars');
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      throw new BadRequestException('Invalid username format');
    }

    const exists = await this.userModel.findOne({ userName: username });

    if (exists) {
      throw new BadRequestException('Username already exists');
    }

    return username;
  }
}