import {
    Injectable,
    PipeTransform,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDoc } from '../../modules/users/users.schema';

@Injectable()
export class EmailPipe implements PipeTransform {
    constructor(
        @InjectModel('User')
        private readonly userModel: Model<UserDoc>,
    ) { }

    async transform(value: any) {
        if (typeof value !== 'string') {
            throw new BadRequestException('Invalid email');
        }

        const email = value.trim().toLowerCase();

        if (!email) {
            throw new BadRequestException('Email required');
        }

        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!regex.test(email)) {
            throw new BadRequestException('Invalid email format');
        }

        const exists = await this.userModel.findOne({ email });

        if (exists) {
            throw new BadRequestException('Email already exists');
        }

        return email;
    }
}