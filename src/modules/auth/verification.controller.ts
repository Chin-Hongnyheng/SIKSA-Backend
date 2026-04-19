import { Body, Controller, Post } from '@nestjs/common';
import { VerificationService } from './verification.service';

@Controller('auth')
export class VerificationController {
    constructor(private verificationService: VerificationService) { }

    // SEND OTP
    @Post('send-otp')
    async sendOtp(@Body() body: { email: string }) {
        await this.verificationService.sendEmailOtp(body.email);

        return {
            message: 'OTP sent successfully',
        };
    }

    // VERIFY OTP
    @Post('verify-otp')
    async verifyOtp(@Body() body: { email: string; otp: string }) {
        await this.verificationService.verifyEmailOtp(
            body.email,
            body.otp,
        );

        return {
            message: 'Email verified successfully',
        };
    }
}