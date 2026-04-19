import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { userSchema } from './users.schema';
import { UserResolver } from './users.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: userSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, UserResolver],
})
export class UsersModule { }
