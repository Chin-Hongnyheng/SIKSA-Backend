import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, NullExpression } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UserDoc } from './users.schema';
import { CreateLoginInput } from './dto/login.input';
import { CreateRegisterInput } from './dto/register.input';
import { CreateForgetInput } from './dto/forget.input';
import { PasswordPipe } from 'src/common/pipe/password.pipe';
import { UpdateUserInput } from './dto/update.input';
import { getAuth } from 'firebase-admin/auth';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<UserDoc>,
    private jwt: JwtService,
    private passwordPipe: PasswordPipe,
  ) {}

  async register(input: CreateRegisterInput) {
    try {
      const { userName, email, phone, password, confirmPassword, role } = input;

      if (password !== confirmPassword) {
        throw new UnauthorizedException('Passwords do not match');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = (await this.userModel.create({
        userName,
        email,
        phone,
        password: hashedPassword,
        role: (role as any) || 'User',
      })) as any;

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
        message: 'User registered successfully',
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
    const email = input.email.trim().toLowerCase();

    const user = await this.userModel.findOne({ email });

    if (!user) throw new UnauthorizedException('Invalid Password');

    const isValid = await bcrypt.compare(input.password, user.password);

    if (!isValid) throw new UnauthorizedException('Invalid Password');

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

    return { accessToken, refreshToken };
  }

  async validateLogin(input: CreateLoginInput) {
    const email = input.email.trim().toLowerCase();

    const user = await this.userModel.findOne({ email });

    if (!user) throw new UnauthorizedException('No user found!');

    const isValid = await bcrypt.compare(input.password, user.password);

    if (!isValid) throw new UnauthorizedException('Incorrect Password');

    return true;
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

      return { accessToken: newAccessToken, refreshToken };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getMe(userId: string) {
    return this.userModel.findById(userId).select('-password');
  }

  async forgetPassword(input: CreateForgetInput) {
    const { email, newPassword, confirmPassword } = input;

    const validatedPassword = await this.passwordPipe.transform(newPassword);

    if (validatedPassword !== confirmPassword) {
      throw new UnauthorizedException('Passwords do not match');
    }

    const user = await this.userModel.findOne({ email });

    if (!user) throw new UnauthorizedException('User not found');

    const hashedPassword = await bcrypt.hash(validatedPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return { message: 'Password reset successfully' };
  }

  async updateProfile(userId: string, input: UpdateUserInput) {
    console.log('Updated input:', input);

    if (input.userName) {
      const existingUser = await this.userModel.findOne({
        userName: input.userName,
        _id: { $ne: userId },
      });
      if (existingUser) {
        throw new UnauthorizedException('Username already exists');
      }
    }

    if (input.phone) {
      const existingPhone = await this.userModel.findOne({
        phone: input.phone,
        _id: { $ne: userId },
      });
      if (existingPhone) {
        throw new UnauthorizedException('Phone number already exists');
      }
    }

    const user = await this.userModel.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');

    Object.assign(user, input);
    await user.save();

    return user;
  }

  async validateRegister(input: CreateRegisterInput) {
    const { userName, email, phone, password, confirmPassword } = input;

    if (password !== confirmPassword) {
      throw new UnauthorizedException('Passwords do not match');
    }

    const existingUserName = await this.userModel.findOne({ userName });
    if (existingUserName)
      throw new UnauthorizedException('Username already exists');

    const existingEmail = await this.userModel.findOne({ email });
    if (existingEmail) throw new UnauthorizedException('Email already exists');

    const existingPhone = await this.userModel.findOne({ phone });
    if (existingPhone)
      throw new UnauthorizedException('Phone number already exists');

    return true;
  }

  async googleAuth(input: { idToken: string; role: string }) {
    const decoded = await getAuth().verifyIdToken(input.idToken);
    const { email, name, picture } = decoded;

    if (!email) throw new UnauthorizedException('No email from Google');

    let user = await this.userModel.findOne({ email });

    if (!user) {
      const validRoles = ['User', 'Admin'];
      const role = validRoles.includes(input.role)
        ? (input.role as 'User' | 'Admin')
        : 'User';

      user = await this.userModel.create({
        userName: name || email.split('@')[0],
        email,
        phone: null,
        password: 'GOOGLE_AUTH',
        role,
        photo_url: picture ?? null,
      } as any);
    }

    const payload = {
      sub: (user as any)._id.toString(),
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

    return { accessToken, refreshToken };
  }
  async updatePhoto(userId: string, photoUrl: string) {
    return this.userModel
      .findByIdAndUpdate(userId, { photo_url: photoUrl }, { new: true })
      .select('-password');
  }
}
