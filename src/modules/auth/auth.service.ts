import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

import { UserDoc } from '../users/users.schema';
import { CreateLoginInput } from '../users/dto/login.input';
import { CreateRegisterInput } from '../users/dto/register.input';
import { CreateForgetInput } from '../users/dto/forget.input';
import { PasswordPipe } from 'src/common/pipe/password.pipe';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel('User') private userModel: Model<UserDoc>,
        private jwt: JwtService,
        private passwordPipe: PasswordPipe,
    ) { }

    async register(input: CreateRegisterInput) {
        try {
            const { userName, email, phone, password, confirmPassword, role } = input;

            if (password !== confirmPassword) {
                throw new UnauthorizedException("Passwords do not match");
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await this.userModel.create({
                userName,
                email,
                phone,
                password: hashedPassword,
                role: role || 'student',
            });

            // same payload as login
            const payload = {
                sub: user._id.toString(),
                role: user.role,
                userName: user.userName,
            };

            const accessToken = this.jwt.sign(payload, {
                secret: process.env.JWT_ACCESS_SECRET!,
                expiresIn: process.env.JWT_ACCESS_EXPIRES as any,
            });

            const refreshToken = this.jwt.sign(payload, {
                secret: process.env.JWT_REFRESH_SECRET!,
                expiresIn: process.env.JWT_REFRESH_EXPIRES as any,
            });

            return {
                message: "User registered successfully",
                accessToken,
                refreshToken,
            };

        } catch (error: any) {
            if (error.code == 11000) {
                const field = Object.keys(error.keyPattern)[0];
                throw new UnauthorizedException(`${field} already exists`);
            }
            throw error;
        }
    }

    async login(input: CreateLoginInput) {
        const user = await this.userModel.findOne({
            email: input.email,
        });

        if (!user) throw new UnauthorizedException('Invalid credentials');

        const isValid = await bcrypt.compare(
            input.password,
            user.password,
        );

        if (!isValid)
            throw new UnauthorizedException('Invalid credentials');

        const payload = {
            sub: user._id.toString(),
            role: user.role,
            userName: user.userName,
        };

        const accessToken = this.jwt.sign(payload, {
            secret: process.env.JWT_ACCESS_SECRET!,
            expiresIn: process.env.JWT_ACCESS_EXPIRES as any,
        });

        const refreshToken = this.jwt.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET!,
            expiresIn: process.env.JWT_REFRESH_EXPIRES as any,
        });

        return {
            accessToken,
            refreshToken,
        };
    }

    async refresh(refreshToken: string) {
        try {
            const payload = this.jwt.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET!,
            });

            const user = await this.userModel.findById(payload.sub);

            if (!user) throw new UnauthorizedException();

            const newAccessToken = this.jwt.sign(
                {
                    sub: user._id.toString(),
                    role: user.role,
                    userName: user.userName,
                },
                {
                    secret: process.env.JWT_ACCESS_SECRET!,
                    expiresIn: process.env.JWT_ACCESS_EXPIRES as any,
                },
            );

            return {
                accessToken: newAccessToken,
                refreshToken,
            };
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async getMe(userId: string) {
        return this.userModel.findById(userId).select('-password');
    }

    async forgetPassword(input: CreateForgetInput) {
        const { email, newPassword, confirmPassword } = input;

        const validatedPassword =
            await this.passwordPipe.transform(newPassword);

        if (newPassword !== confirmPassword) {
            throw new UnauthorizedException("Passwords do not match");
        }

        const user = await this.userModel.findOne({ email });

        if (!user) {
            throw new UnauthorizedException("User not found");
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;

        await user.save();

        return {
            message: "Password reset successfully",
        };
    }
}