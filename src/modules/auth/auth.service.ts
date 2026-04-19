import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

import { UserDoc } from '../users/users.schema';
import { CreateLoginInput } from '../users/dto/login.input';
import { CreateRegisterInput } from '../users/dto/register.input';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel('User') private userModel: Model<UserDoc>,
        private jwt: JwtService,
    ) { }

    async register(input: CreateRegisterInput) {
        const hashedPassword = await bcrypt.hash(input.password, 10);

        await this.userModel.create({
            userName: input.userName,
            email: input.email,
            phone: input.phone,
            password: hashedPassword,
            role: input.role || 'student',
        });

        return { message: 'User registered successfully' };
    }

    async login(input: CreateLoginInput) {
        const user = await this.userModel.findOne({
            userName: input.userName,
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
}