import { Module, Global } from '@nestjs/common';
import { RedisService } from './redis.service';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_OPTIONS',
      useFactory: (configService: ConfigService) => ({
        host: configService.get<string>('REDIS_HOST') || 'redis',
        port: parseInt(configService.get<string>('REDIS_PORT') || '6379', 10),
        password: configService.get<string>('REDIS_PASSWORD') || undefined, // undefined if not set
      }),
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}