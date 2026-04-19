import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

import { CreateLoginInput } from '../users/dto/login.input';
import { CreateRegisterInput } from '../users/dto/register.input';

import { LoginResponse } from '../users/dto/login.response';
import { RegisterResponse } from '../users/dto/register.response';
import { UserType } from '../users/dto/users.type';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) { }

  @Mutation(() => RegisterResponse)
  register(@Args('input') input: CreateRegisterInput) {
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