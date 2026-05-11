import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
} from '@nestjs/common';
import { RedisService } from '../modules/redis/redis.service';

@Injectable()
export class VerifiedGuard implements CanActivate {
    constructor(private redis: RedisService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const user = request.currentUser; // from AuthGuard

        if (!user?.email) {
            throw new ForbiddenException('Not authenticated');
        }

        const isVerified = await this.redis.get(
            `verified:${user.email}`,
        );

        if (!isVerified) {
            throw new ForbiddenException('Email not verified');
        }

        return true;
    }
}