import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { generateOtp } from '../../utils/otp.util';
import { EmailService } from '../../notifications/email.service';

@Injectable()
export class VerificationService {
  private OTP_TTL = 300; // 5 minutes

  constructor(
    private redis: RedisService,
    private emailService: EmailService,
  ) {}

  // SEND OTP
  async sendEmailOtp(email: string) {
    const key = `otp:email:${email}`;

    const existing = await this.redis.get(key);
    if (existing) {
      throw new BadRequestException('OTP already sent. Wait before retry.');
    }

    const otp = generateOtp(6);

    await this.redis.set(key, otp, this.OTP_TTL);

    try {
      await this.emailService.sendOtp(email, otp);
    } catch {
      await this.redis.delete(key);
      throw new InternalServerErrorException('Failed to send OTP email');
    }
  }

  // VERIFY OTP
  async verifyEmailOtp(email: string, otp: string) {
    const key = `otp:email:${email}`;

    const storedOtp = await this.redis.get(key);

    if (!storedOtp || storedOtp !== otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    await this.redis.delete(key);

    // mark verified (24h)
    await this.redis.set(`verified:${email}`, '1', 86400);

    return true;
  }
}
