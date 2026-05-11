import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AssessmentDoc, AssessmentModel } from './assessments.schema';
import { CreateAssessmentInput } from './dto/createAssessment.input';
import { DeleteAssessmentInput } from './dto/deleteAssessment.input';
import { CourseDoc, CourseModel } from '../courses/courses.schema';

@Injectable()
export class AssessmentsService {
  constructor(
    @InjectModel('Assessment')
    private readonly assessmentModel: Model<AssessmentDoc>,
    @InjectModel('Course')
    private readonly courseModel: Model<CourseDoc>,
  ) {}

  private mapAssessment(a: AssessmentDoc, courseCode: string) {
    return {
      assessmentName: a.assessmentName,
      courseCode: courseCode,
      createdBy: a.created_by?.toString(),
      createdAt: a.created_at,
    };
  }

  async createAssessment(input: CreateAssessmentInput, userId: string) {
    const course = await this.courseModel.findOne({
      courseCode: input.courseCode,
    });
    // is this course exist?
    if (!course) {
      throw new Error(`Course with code "${input.courseCode}" not found`);
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
      course: course._id,
      created_by: userId,
      created_at: new Date(),
    });

    await assessment.save();
    return { message: 'Assessment created successfully' };
  }

  async deleteAssessment(input: DeleteAssessmentInput) {
    const course = await this.courseModel.findOne({
      courseCode: input.courseCode,
    });
    if (!course) {
      throw new Error(`Course with code "${input.courseCode}" not found`);
    }

    // Delete it
    const deleted = await this.assessmentModel.findOneAndDelete({
      course: course._id,
      assessmentName: input.assessmentName,
    });

    if (!deleted) {
      throw new Error(
        `Assessment "${input.assessmentName}" not found for course "${input.courseCode}"`,
      );
    }

    return { message: 'Assessment deleted successfully' };
  }

  async getAssessmentsByCourseCode(courseCode: string) {
    const course = await this.courseModel.findOne({ courseCode });
    if (!course) {
      throw new NotFoundException(`Course with code "${courseCode}" not found`);
    }

    const assessments = await this.assessmentModel
      .find({ course: course._id })
      .sort({ created_at: -1 })
      .exec();

    // pass courseCode directly instead of spreading into toObject()
    return assessments.map((a) => this.mapAssessment(a, courseCode));
  }

  async getAllMyAssessments(userId: string) {
    const assessments = await this.assessmentModel
      .find({ created_by: userId })
      .populate('course', 'courseCode')
      .sort({ created_at: -1 })
      .exec();

    return assessments.map((a) => {
      const populated = a.course as unknown as CourseDoc;
      return this.mapAssessment(a, populated?.courseCode ?? '');
    });
  }
}
