import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InstructorsController } from './instructors.controller';
import { InstructorsService } from './instructors.service';
import { instructorSchema } from './instructors.schema';
import { InstructorResolver } from './instructor.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Instructor', schema: instructorSchema }])
  ],
  controllers: [InstructorsController],
  providers: [InstructorsService, InstructorResolver]
})
export class InstructorsModule {}
