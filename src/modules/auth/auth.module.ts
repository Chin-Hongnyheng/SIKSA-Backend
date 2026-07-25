import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from '../../strategies/jwt-auth.strategy';
import { User, userSchema } from './users.schema';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { VerifyUserPipe } from 'src/common/pipe/user-verification.pipe';
import { UsernamePipe } from 'src/common/pipe/username.pipe';
import { EmailPipe } from 'src/common/pipe/email.pipe';
import { PasswordPipe } from 'src/common/pipe/password.pipe';
import { UserBlock } from 'src/common/pipe/UserBlock.pipe';
import { EmailService } from '../../notifications/email.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([{ name: 'User', schema: userSchema }]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
    }),
  ],
  providers: [
    AuthService,
    AuthResolver,
    JwtStrategy,
    VerificationService,
    VerifyUserPipe,
    UsernamePipe,
    EmailPipe,
    PasswordPipe,
    UserBlock,
    EmailService,
  ],
  controllers: [VerificationController, AuthController],
  exports: [JwtModule, PassportModule],
})
export class AuthModule {}
