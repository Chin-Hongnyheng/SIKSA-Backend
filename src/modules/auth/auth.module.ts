import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from '../../strategies/jwt-auth.strategy';
import { User, userSchema } from '../users/users.schema';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { EmailService } from 'src/notifications/email.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([{ name: 'User', schema: userSchema }]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [AuthService, AuthResolver, JwtStrategy, VerificationService, EmailService],
  controllers: [VerificationController],
  exports: [JwtModule, PassportModule],
})
export class AuthModule { }