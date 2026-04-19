import * as crypto from 'crypto';

export function generateOtp(length = 6): string {
    const digits = '0123456789';
    const bytes = crypto.randomBytes(length);

    return Array.from(bytes)
        .map((b) => digits[b % 10])
        .join('');
}