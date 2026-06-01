import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
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

  private mapSubscriber(user: any) {
    return {
      id: user._id?.toString() ?? user.id?.toString() ?? '',
      userName: user.userName,
      email: user.email,
    };
  }

  private mapCourse(c: CourseDoc | any, currentUserId?: string) {
    const creator = c.created_by;
    const subscribers = c.subscribers ?? [];
    const creatorName =
      creator && typeof creator === 'object' && 'userName' in creator
        ? creator.userName
        : creator?.toString();
    const subscriberIds = subscribers.map((subscriber: any) =>
      subscriber?._id ? subscriber._id.toString() : subscriber?.toString(),
    );

    return {
      courseName: c.courseName,
      courseCode: c.courseCode,
      description: c.description,
      createdBy: creatorName,
      createdAt: c.created_at,
      subscriberCount: subscriberIds.length,
      isSubscribed: currentUserId
        ? subscriberIds.includes(currentUserId)
        : false,
      subscribers: subscribers
        .filter((subscriber: any) => subscriber?.userName && subscriber?.email)
        .map((subscriber: any) => this.mapSubscriber(subscriber)),
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
      subscribers: [],
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

  async subscribeCourse(courseCode: string, userId: string) {
    const course = await this.courseModel.findOneAndUpdate(
      { courseCode },
      { $addToSet: { subscribers: userId } },
      { new: true },
    );

    if (!course) {
      throw new NotFoundException(`Course with code "${courseCode}" not found`);
    }

    return { message: 'Course subscribed successfully' };
  }

  async getAllCourses(currentUserId?: string) {
    const courses = await this.courseModel
      .find()
      .populate('created_by', 'userName')
      .sort({ created_at: -1 })
      .exec();
    return courses.map((c) => this.mapCourse(c, currentUserId));
  }

  async getCourseByCode(courseCode: string, currentUserId?: string) {
    const course = await this.courseModel
      .findOne({ courseCode })
      .populate('created_by', 'userName')
      .populate('subscribers', 'userName email');
    if (!course) {
      throw new NotFoundException(`Course with code "${courseCode}" not found`);
    }
    return this.mapCourse(course, currentUserId);
  }

  async getMyCourses(userId: string) {
    const courses = await this.courseModel
      .find({ created_by: userId })
      .populate('created_by', 'userName')
      .populate('subscribers', 'userName email')
      .sort({ created_at: -1 })
      .exec();
    return courses.map((c) => this.mapCourse(c));
  }

  async getCourseSubscribers(
    courseCode: string,
    userId: string,
    role?: string,
  ) {
    const course = await this.courseModel
      .findOne({ courseCode })
      .populate('subscribers', 'userName email');

    if (!course) {
      throw new NotFoundException(`Course with code "${courseCode}" not found`);
    }

    if (role !== 'Admin' && course.created_by?.toString() !== userId) {
      throw new ForbiddenException(
        'You can only view your own course students',
      );
    }

    return (course.subscribers ?? []).map((subscriber: any) =>
      this.mapSubscriber(subscriber),
    );
  }

  async getMyTotalStudents(userId: string) {
    const courses = await this.courseModel.find({ created_by: userId }).exec();
    const studentIds = new Set<string>();

    courses.forEach((course) => {
      (course.subscribers ?? []).forEach((subscriber: any) => {
        studentIds.add(subscriber.toString());
      });
    });

    return studentIds.size;
  }
}
