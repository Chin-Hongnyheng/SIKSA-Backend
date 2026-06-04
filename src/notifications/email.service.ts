import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  async sendOtp(email: string, otp: string): Promise<void> {
    console.log('================ EMAIL DEBUG ================');
    console.log('MAIL_USER:', process.env.MAIL_USER);
    console.log('MAIL_HOST:', process.env.MAIL_HOST);
    console.log('MAIL_PORT:', process.env.MAIL_PORT);
    console.log('Sending OTP to:', email);
    console.log('OTP CODE FOR TESTING:', otp);
    console.log('=============================================');

    try {
      await this.transporter.verify();
      console.log('SMTP connection verified successfully');

      const info = await this.transporter.sendMail({
        from: `"SIKSA" <${process.env.MAIL_USER}>`,
        to: email,
        subject: 'Your SIKSA OTP Code',
        text: `Your SIKSA OTP code is ${otp}. This code will expire in 5 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>SIKSA OTP Verification</h2>
            <p>Your OTP code is:</p>
            <p style="font-size: 28px; font-weight: bold; letter-spacing: 4px;">
              ${otp}
            </p>
            <p>This code will expire in 5 minutes.</p>
            <p>If you did not request this code, please ignore this email.</p>
          </div>
        `,
      });

      console.log('OTP EMAIL SENT SUCCESSFULLY');
      console.log('Accepted:', info.accepted);
      console.log('Rejected:', info.rejected);
      console.log('Message ID:', info.messageId);
    } catch (error) {
      console.error('OTP EMAIL SEND FAILED');
      console.error(error);
      throw error;
    }
  }
}