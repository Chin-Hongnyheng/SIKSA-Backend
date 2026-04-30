import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

import { CreateLoginInput } from '../users/dto/login.input';
import { CreateRegisterInput } from '../users/dto/register.input';
import { CreateForgetInput } from '../users/dto/forget.input';
import { ForgetResponse } from '../users/dto/forget.response';
import { LoginResponse } from '../users/dto/login.response';
import { RegisterResponse } from '../users/dto/register.response';
import { UserType } from '../users/dto/users.type';
import { VerifyUserPipe } from '../../common/pipe/user-verification.pipe';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) { }

  @Mutation(() => String)
  validateRegister(
    @Args('input', VerifyUserPipe) input: CreateRegisterInput,
  ) {
    return 'validation success';
  }


  @Mutation(() => RegisterResponse)
  register(@Args('input', VerifyUserPipe) input: CreateRegisterInput) {
    return this.authService.register(input);
  }

  @Mutation(() => LoginResponse)
  login(@Args('input') input: CreateLoginInput) {
    return this.authService.login(input);
  }

  @Mutation(() => LoginResponse)
  refresh(@Args('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  @Mutation(() => ForgetResponse)
  forgetPassword(@Args('input') input: CreateForgetInput) {
    return this.authService.forgetPassword(input);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => UserType)
  async me(@Context() ctx: any) {
    const userId = ctx.req.user?.userId;

    if (!userId) {
      throw new Error('Unauthorized');
    }

    return this.authService.getMe(userId);
  }
}