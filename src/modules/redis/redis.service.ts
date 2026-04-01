import { Injectable, Inject, OnApplicationBootstrap, OnModuleDestroy, Logger } from '@nestjs/common';
import * as redis from 'redis';

@Injectable()
export class RedisService implements OnApplicationBootstrap, OnModuleDestroy {
  private client: redis.RedisClientType;
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject('REDIS_OPTIONS') private options: any) { }

  async onApplicationBootstrap() {
    const { host, port, password } = this.options;
    this.logger.log(`Connecting to Redis at ${host}:${port} with password: "${password}"`);
    this.client = redis.createClient({
      socket: {
        host,
        port,
        connectTimeout: 10000, // Wait up to 10 seconds for the initial connection
        reconnectStrategy: (retries) => {
          this.logger.warn(`Redis reconnection attempt #${retries}`);
          if (retries > 10) {
            return new Error('Max retries reached');
          }
          return Math.min(retries * 100, 3000); // Wait longer between retries
        }
      },
      password: password || undefined,
    });

    this.client.on('error', (err) => this.logger.error('Redis Client Error', err));
    this.client.on('connect', () => this.logger.log('Connected to Redis'));
    this.client.on('ready', () => this.logger.log('Redis Client Ready'));

    try {
      await this.client.connect();
    } catch (err) {
      this.logger.error(`Failed to connect to Redis at ${host}:${port}`, err);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  async set(key: string, val: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, val, { EX: ttlSeconds });
    } else {
      await this.client.set(key, val);
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async flushAll(): Promise<void> {
    await this.client.flushAll();
  }
}