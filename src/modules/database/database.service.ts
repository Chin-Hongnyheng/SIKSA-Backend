import { InjectConnection } from '@nestjs/mongoose';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  onModuleInit() {
    if (this.connection.readyState === 1) {
      this.logger.log(`Connected to MongoDB (${this.connection.name})`);
    }
  }
}
