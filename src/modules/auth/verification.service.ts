import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { generateOtp } from '../../utils/otp.util';
import * as nodemailer from 'nodemailer';

@Injectable()
export class VerificationService {
  private OTP_TTL = 300; // 5 minutes

  constructor(private redis: RedisService) {}

  // SEND OTP
  async sendEmailOtp(email: string) {
    const key = `otp:email:${email}`;

    const existing = await this.redis.get(key);
    if (existing) {
      throw new BadRequestException('OTP already sent. Wait before retry.');
    }

    const otp = generateOtp(6);

    // store OTP in redis first
    await this.redis.set(key, otp, this.OTP_TTL);

    // send email using nodemailer
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT, 10) : 587,
        secure: process.env.MAIL_PORT === '465',
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.MAIL_USER,
        to: email,
        subject: 'Your verification code',
        text: `Your verification code is: ${otp}`,
        html: `<p>Your verification code is: <b>${otp}</b></p>`,
      };

      await transporter.sendMail(mailOptions);
    } catch (err) {
      // failed to send email — clean up stored OTP and bubble error
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
