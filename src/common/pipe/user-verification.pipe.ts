import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

import { UsernamePipe } from './username.pipe';
import { EmailPipe } from './email.pipe';
import { PasswordPipe } from './password.pipe';
import { UserBlock } from './UserBlock.pipe';
import { CreateRegisterInput } from '../../modules/auth/dto/register.input';

@Injectable()
export class VerifyUserPipe implements PipeTransform {
  constructor(
    private readonly usernamePipe: UsernamePipe,
    private readonly emailPipe: EmailPipe,
    private readonly passwordPipe: PasswordPipe,
    private readonly userBlockPipe: UserBlock,
  ) {}

  async transform(value: CreateRegisterInput): Promise<CreateRegisterInput> {
    if (!value) {
      throw new BadRequestException('Request body is required');
    }

    value.userName = await this.usernamePipe.transform(value.userName);
    value.email = await this.emailPipe.transform(value.email);
    value.password = this.passwordPipe.transform(value.password);

    value = this.userBlockPipe.transform(value);

    if (value.password !== value.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    return value;
  }
}
