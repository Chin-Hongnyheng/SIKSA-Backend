import { Injectable, OnModuleInit } from '@nestjs/common';
import mongoose from 'mongoose';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const uri = this.configService.get<string>('MONGO_URI')!;
    const dbName = this.configService.get<string>('MONGO_DB')!;
    await mongoose.connect(uri, { dbName });
    console.log('Connected to MongoDB');
  }
}