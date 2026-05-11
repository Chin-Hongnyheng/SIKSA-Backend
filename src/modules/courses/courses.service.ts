import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CourseDoc } from './courses.schema';
import { CreateCourseInput } from './dto/createCourse.input';
import { EditCourseInput } from './dto/editCourse.input';
import { DeleteCourseInput } from './dto/deleteCourse.input';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel('Course') private readonly courseModel: Model<CourseDoc>,
  ) {}

  private mapCourse(c: CourseDoc) {
    return {
      courseName: c.courseName,
      courseCode: c.courseCode,
      description: c.description,
      createdBy: c.created_by?.toString(),
      createdAt: c.created_at,
    };
  }

  async createCourse(input: CreateCourseInput, userId: string) {
    const existing = await this.courseModel.findOne({
      courseCode: input.courseCode,
    });
    if (existing) {
      throw new Error(`Course with code "${input.courseCode}" already exists`);
    }

    const course = new this.courseModel({
      ...input,
      created_by: userId,
      created_at: new Date(),
    });

    await course.save();
    return { message: 'Course created successfully' };
  }

  async editCourse(input: EditCourseInput) {
    const course = await this.courseModel.findOneAndUpdate(
      { courseCode: input.courseCode },
      {
        ...(input.courseName && { courseName: input.courseName }),
        ...(input.newCourseCode && { courseCode: input.newCourseCode }),
        ...(input.description !== undefined && {
          description: input.description,
        }),
      },
      { new: true },
    );

    if (!course) {
      throw new NotFoundException(
        `Course with code "${input.courseCode}" not found`,
      );
    }

    return { message: 'Course updated successfully' };
  }

  async deleteCourse(input: DeleteCourseInput) {
    const deleted = await this.courseModel.findOneAndDelete({
      courseCode: input.courseCode,
    });

    if (!deleted) {
      throw new NotFoundException(
        `Course with code "${input.courseCode}" not found`,
      );
    }

    return { message: 'Course deleted successfully' };
  }

  async getAllCourses() {
    const courses = await this.courseModel
      .find()
      .sort({ created_at: -1 })
      .exec();
    return courses.map((c) => this.mapCourse(c));
  }

  async getCourseByCode(courseCode: string) {
    const course = await this.courseModel.findOne({ courseCode });
    if (!course) {
      throw new NotFoundException(`Course with code "${courseCode}" not found`);
    }
    return this.mapCourse(course);
  }

  async getMyCourses(userId: string) {
    const courses = await this.courseModel
      .find({ created_by: userId })
      .sort({ created_at: -1 })
      .exec();
    return courses.map((c) => this.mapCourse(c));
  }
}
