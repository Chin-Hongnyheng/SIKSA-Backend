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

        console.log('MAIL_USER (sender):', process.env.MAIL_USER);
        console.log('MAIL_PASS (app password):', process.env.MAIL_PASS);

        console.log('MAIL_HOST:', process.env.MAIL_HOST);
        console.log('MAIL_PORT:', process.env.MAIL_PORT);

        console.log('Sending OTP to (receiver):', email);

        console.log('=============================================');
        await this.transporter.sendMail({
            from: `"SIKSA" <${process.env.MAIL_USER}>`,
            to: email,
            subject: 'Your OTP Code',
            html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Your OTP Code</h2>
          <p style="font-size: 20px; font-weight: bold;">
            ${otp}
          </p>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `,
        });
    }
}