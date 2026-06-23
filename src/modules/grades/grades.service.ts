import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GradeDoc } from './grades.schema';
import { CourseDoc } from '../courses/courses.schema';
import { UserDoc } from '../auth/users.schema';
import { UpsertGradeInput } from './dto/upsertGrade.input';
import { UpsertGradesInput } from './dto/upsertGrades.input';

@Injectable()
export class GradesService {
  constructor(
    @InjectModel('Grade')
    private readonly gradeModel: Model<GradeDoc>,
    @InjectModel('Course')
    private readonly courseModel: Model<CourseDoc>,
    @InjectModel('User')
    private readonly userModel: Model<UserDoc>,
  ) {}

  // ── Helpers ──────────────────────────────────────────

  private isCourseOwner(course: CourseDoc, userId: string) {
    return course.created_by?.toString() === userId;
  }

  private async findCourseOrThrow(courseCode: string) {
    const course = await this.courseModel.findOne({ courseCode });
    if (!course) {
      throw new NotFoundException(
        `Course with code "${courseCode}" not found`,
      );
    }
    return course;
  }

  private mapGrade(
    g: GradeDoc,
    courseCode: string,
    studentName: string,
  ) {
    return {
      studentId: g.studentId?.toString(),
      studentName,
      courseCode,
      assessmentName: g.assessmentName,
      score: g.score,
      maxScore: g.maxScore,
      gradedBy: g.gradedBy?.toString(),
      gradedAt: g.gradedAt,
    };
  }

  // ── Single Upsert ───────────────────────────────────

  async upsertGrade(input: UpsertGradeInput, userId: string, role: string) {
    const course = await this.findCourseOrThrow(input.courseCode);

    if (role !== 'Admin' && !this.isCourseOwner(course, userId)) {
      throw new ForbiddenException(
        'You can only grade students in your own courses',
      );
    }

    const score = input.score;
    const maxScore = input.maxScore ?? 100;

    if (score < 0 || score > maxScore) {
      throw new Error(
        `Score must be between 0 and ${maxScore}`,
      );
    }

    await this.gradeModel.findOneAndUpdate(
      {
        studentId: input.studentId,
        course: course._id,
        assessmentName: input.assessmentName,
      },
      {
        $set: {
          score,
          maxScore,
          gradedBy: userId,
          gradedAt: new Date(),
        },
        $setOnInsert: {
          studentId: input.studentId,
          course: course._id,
          assessmentName: input.assessmentName,
        },
      },
      { upsert: true, new: true },
    );

    return { message: 'Grade saved successfully' };
  }

  // ── Batch Upsert ────────────────────────────────────

  async upsertGrades(input: UpsertGradesInput, userId: string, role: string) {
    const ops = input.grades.map((g) => this.upsertGrade(g, userId, role));
    await Promise.all(ops);
    return { message: `${input.grades.length} grade(s) saved successfully` };
  }

  // ── Query: grades by course ─────────────────────────

  async getGradesByCourse(courseCode: string, userId: string, role: string) {
    const course = await this.findCourseOrThrow(courseCode);

    if (role !== 'Admin' && !this.isCourseOwner(course, userId)) {
      throw new ForbiddenException(
        'You can only view grades for your own courses',
      );
    }

    const grades = await this.gradeModel
      .find({ course: course._id })
      .sort({ assessmentName: 1 })
      .exec();

    // Build a map of student IDs → names for the response
    const studentIds = [...new Set(grades.map((g) => g.studentId.toString()))];
    const students = await this.userModel
      .find({ _id: { $in: studentIds } })
      .select('_id userName')
      .exec();

    const nameMap = new Map<string, string>();
    for (const s of students) {
      nameMap.set(s._id.toString(), s.userName);
    }

    return grades.map((g) =>
      this.mapGrade(
        g,
        courseCode,
        nameMap.get(g.studentId.toString()) ?? 'Unknown',
      ),
    );
  }
}
