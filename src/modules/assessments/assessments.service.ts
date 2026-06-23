import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AssessmentDoc, AssessmentModel } from './assessments.schema';
import { CreateAssessmentInput } from './dto/createAssessment.input';
import { DeleteAssessmentInput } from './dto/deleteAssessment.input';
import { CourseDoc, CourseModel } from '../courses/courses.schema';
import { GradeDoc } from '../grades/grades.schema';

@Injectable()
export class AssessmentsService {
  constructor(
    @InjectModel('Assessment')
    private readonly assessmentModel: Model<AssessmentDoc>,
    @InjectModel('Course')
    private readonly courseModel: Model<CourseDoc>,
    @InjectModel('Grade')
    private readonly gradeModel: Model<GradeDoc>,
  ) {}

  private mapAssessment(a: AssessmentDoc, courseCode: string) {
    return {
      assessmentName: a.assessmentName,
      courseCode: courseCode,
      guide: a.guide,
      icon: a.icon,
      color: a.color,
      imageBase64: a.imageBase64,
      createdBy: a.created_by?.toString(),
      createdAt: a.created_at,
    };
  }

  private isCourseOwner(course: CourseDoc, userId: string) {
    return course.created_by?.toString() === userId;
  }

  private isCourseSubscriber(course: CourseDoc, userId: string) {
    return (course.subscribers ?? []).some(
      (subscriber: any) => subscriber?.toString() === userId,
    );
  }

  async createAssessment(
    input: CreateAssessmentInput,
    userId: string,
    role: string,
  ) {
    const course = await this.courseModel.findOne({
      courseCode: input.courseCode,
    });
    // is this course exist?
    if (!course) {
      throw new Error(`Course with code "${input.courseCode}" not found`);
    }

    if (role !== 'Admin' && !this.isCourseOwner(course, userId)) {
      throw new ForbiddenException(
        'You can only create assessments for your own courses',
      );
    }

    const existing = await this.assessmentModel.findOne({
      course: course._id,
      assessmentName: input.assessmentName,
    });
    // is this assessment name existing?
    if (existing) {
      throw new Error(
        `Assessment "${input.assessmentName}" already exists for course "${input.courseCode}"`,
      );
    }

    const assessment = new this.assessmentModel({
      assessmentName: input.assessmentName,
      guide: input.guide?.trim() || null,
      icon: input.icon?.trim() || null,
      color: input.color?.trim() || null,
      imageBase64: input.imageBase64 || null,
      course: course._id,
      created_by: userId,
      created_at: new Date(),
    });

    await assessment.save();
    return { message: 'Assessment created successfully' };
  }

  async deleteAssessment(
    input: DeleteAssessmentInput,
    userId: string,
    role: string,
  ) {
    const course = await this.courseModel.findOne({
      courseCode: input.courseCode,
    });
    if (!course) {
      throw new Error(`Course with code "${input.courseCode}" not found`);
    }

    const filter: Record<string, any> = {
      course: course._id,
      assessmentName: input.assessmentName,
    };

    if (role !== 'Admin') {
      filter.created_by = userId;
    }

    const deleted = await this.assessmentModel.findOneAndDelete(filter);

    if (!deleted) {
      throw new Error(
        `Assessment "${input.assessmentName}" not found for course "${input.courseCode}"`,
      );
    }

    // Cascade-delete all grade records tied to this assessment + course
    await this.gradeModel.deleteMany({
      course: course._id,
      assessmentName: input.assessmentName,
    });

    return { message: 'Assessment deleted successfully' };
  }

  async getAssessmentsByCourseCode(
    courseCode: string,
    userId: string,
    role: string,
  ) {
    const course = await this.courseModel.findOne({ courseCode });
    if (!course) {
      throw new NotFoundException(`Course with code "${courseCode}" not found`);
    }

    const filter: Record<string, any> = { course: course._id };

    if (role === 'Teacher') {
      filter.created_by = userId;
    } else if (role === 'Student') {
      if (!this.isCourseSubscriber(course, userId)) {
        throw new ForbiddenException(
          'You can only view assessments for subscribed courses',
        );
      }
    }

    const assessments = await this.assessmentModel
      .find(filter)
      .sort({ created_at: -1 })
      .exec();

    // pass courseCode directly instead of spreading into toObject()
    return assessments.map((a) => this.mapAssessment(a, courseCode));
  }

  async getAllMyAssessments(userId: string, role: string) {
    const filter: Record<string, any> = {};

    if (role === 'Teacher') {
      filter.created_by = userId;
    } else if (role === 'Student') {
      const subscribedCourses = await this.courseModel
        .find({ subscribers: userId })
        .select('_id')
        .exec();

      filter.course = { $in: subscribedCourses.map((course) => course._id) };
    }

    const assessments = await this.assessmentModel
      .find(filter)
      .populate('course', 'courseCode')
      .sort({ created_at: -1 })
      .exec();

    return assessments.map((a) => {
      const populated = a.course as unknown as CourseDoc;
      return this.mapAssessment(a, populated?.courseCode ?? '');
    });
  }
}
