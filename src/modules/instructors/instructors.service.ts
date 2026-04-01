import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Instructor, InstructorDoc, InstructorAttrs } from './instructors.schema';
import { CreateInstructorInput } from './dto/create-instructor.input';

@Injectable()
export class InstructorsService {
  constructor(
    @InjectModel('Instructor') private instructorModel: Model<InstructorDoc>
  ) { }

  async create(createInstructorInput: CreateInstructorInput): Promise<InstructorDoc> {
    const instructor = new this.instructorModel({ createInstructorInput });
    return instructor.save();
  }

  async findAll(): Promise<InstructorDoc[]> {
    return this.instructorModel.find().exec();
  }

  async findOne(instructorId: string): Promise<InstructorDoc> {
    const instructor = await this.instructorModel.findOne({ instructorId }).exec();
    if (!instructor) {
      throw new NotFoundException(`Instructor with ID ${instructorId} not found`);
    }
    return instructor;
  }

  async update(instructorId: string, updateInstructorInput: Partial<CreateInstructorInput>): Promise<InstructorDoc> {
    const existingInstructor = await this.instructorModel.findOneAndUpdate(
      { instructorId },
      { $set: updateInstructorInput },
      { new: true }
    ).exec();

    if (!existingInstructor) {
      throw new NotFoundException(`Instructor with ID ${instructorId} not found`);
    }
    return existingInstructor;
  }

  async delete(instructorId: string): Promise<boolean> {
    const result = await this.instructorModel.deleteOne({ instructorId }).exec();
    return result.deletedCount > 0;
  }
}