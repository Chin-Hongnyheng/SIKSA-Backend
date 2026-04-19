import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDoc } from './users.schema';
import { CreateLoginInput } from './dto/login.input';
import { UserType } from './dto/users.type';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private userModel: Model<UserDoc>,
  ) { }
  private toUserType(user: any): UserType {
    return {
      id: user._id.toString(),
      userName: user.userName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };
  }

  async create(input: CreateLoginInput): Promise<UserType> {
    const user = new this.userModel(input);
    const saved = await user.save();
    return this.toUserType(saved);
  }

  async findAll(): Promise<UserType[]> {
    const users = await this.userModel.find().exec();
    return users.map(u => this.toUserType(u));
  }

  async findOne(id: string): Promise<UserType> {
    const user = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.toUserType(user);
  }

  async update(
    id: string,
    input: Partial<CreateLoginInput>,
  ): Promise<UserType> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { $set: input }, { new: true })
      .exec();

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.toUserType(user);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}