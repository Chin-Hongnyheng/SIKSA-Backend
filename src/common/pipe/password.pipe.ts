import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class PasswordPipe implements PipeTransform {
    transform(value: any) {
        // must be string
        if (typeof value !== 'string') {
            throw new BadRequestException('Invalid password');
        }

        // no leading / trailing spaces
        if (value !== value.trim()) {
            throw new BadRequestException(
                'Password cannot have spaces at start or end',
            );
        }

        const password = value.trim();

        // empty
        if (!password) {
            throw new BadRequestException('Password cannot be empty');
        }

        // length
        if (password.length < 8) {
            throw new BadRequestException(
                'Password must be at least 8 characters',
            );
        }

        if (password.length > 32) {
            throw new BadRequestException(
                'Password must be at most 32 characters',
            );
        }

        // uppercase
        if (!/[A-Z]/.test(password)) {
            throw new BadRequestException(
                'Password must contain at least one uppercase letter',
            );
        }

        // lowercase
        if (!/[a-z]/.test(password)) {
            throw new BadRequestException(
                'Password must contain at least one lowercase letter',
            );
        }

        // number
        if (!/[0-9]/.test(password)) {
            throw new BadRequestException(
                'Password must contain at least one number',
            );
        }

        // special char
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            throw new BadRequestException(
                'Password must contain at least one special character',
            );
        }

        // no spaces inside
        if (/\s/.test(password)) {
            throw new BadRequestException(
                'Password cannot contain spaces',
            );
        }

        return password;
    }
}