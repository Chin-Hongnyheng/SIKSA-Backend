import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

import { CreateLoginInput } from './dto/login.input';
import { CreateRegisterInput } from './dto/register.input';
import { CreateForgetInput } from './dto/forget.input';
import { ForgetResponse } from './dto/forget.response';
import { LoginResponse } from './dto/login.response';
import { RegisterResponse } from './dto/register.response';
import { UserType } from './dto/users.type';
import { VerifyUserPipe } from '../../common/pipe/user-verification.pipe';
import { UpdateUserInput } from './dto/update.input';
import { UpdateResponse } from './dto/update.response';
import { GoogleAuthInput } from './dto/google-auth.input';
import { GoogleAuthResponse } from './dto/google-auth.response';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => String)
  async validateRegister(
    @Args('input', VerifyUserPipe) input: CreateRegisterInput,
  ) {
    await this.authService.validateRegister(input);
    return 'validation register success';
  }

  @Mutation(() => String)
  async validateLogin(@Args('input') input: CreateLoginInput) {
    await this.authService.validateLogin(input);
    return 'validation login success';
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

  @UseGuards(JwtAuthGuard)
  @Mutation(() => UpdateResponse)
  async updateProfile(
    @Context() ctx: any,
    @Args('input') input: UpdateUserInput,
  ) {
    const userId = ctx.req.user?.userId;

    const user = await this.authService.updateProfile(userId, input);

    return {
      message: 'Profile updated successfully',
      user,
    };
  }

  @Mutation(() => GoogleAuthResponse)
  googleAuth(@Args('input') input: GoogleAuthInput) {
    return this.authService.googleAuth(input);
  }
}
