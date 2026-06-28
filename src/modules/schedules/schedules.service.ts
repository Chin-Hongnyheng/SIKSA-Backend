import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ScheduleDoc } from './schedules.schema';
import { CourseDoc } from '../courses/courses.schema';
import { CreateScheduleInput } from './dto/createSchedule.input';
import { EditScheduleInput } from './dto/editSchedule.input';
import { DeleteScheduleInput } from './dto/deleteSchedule.input';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectModel('Schedule')
    private readonly scheduleModel: Model<ScheduleDoc>,
    @InjectModel('Course')
    private readonly courseModel: Model<CourseDoc>,
  ) {}

  private mapSchedule(s: ScheduleDoc, courseCode: string) {
    return {
      scheduleId: s._id.toString(),
      courseCode,
      location: s.location,
      startTime: s.start_time,
      endTime: s.end_time,
      color: s.color ?? null,
      reminder: s.reminder ?? null,
      recurrenceType: s.recurrence_type,
      date: s.date ?? null,
      startDate: s.startDate ?? null,
      endDate: s.endDate ?? null,
      selectedDays: s.selectedDays ?? [],
      createdBy: s.created_by?.toString(),
      createdAt: s.created_at,
    };
  }

  async createSchedule(input: CreateScheduleInput, userId: string) {
    const course = await this.courseModel.findOne({
      courseCode: input.courseCode,
    });
    if (!course) {
      throw new NotFoundException(`Course "${input.courseCode}" not found`);
    }

    // No overlap blocking — frontend warns the user and they choose to proceed.
    const schedule = new this.scheduleModel({
      course: course._id,
      location: input.location,
      start_time: input.startTime,
      end_time: input.endTime,
      ...(input.color && { color: input.color }),
      ...(input.reminder !== undefined && { reminder: input.reminder }),
      recurrence_type: input.recurrenceType,
      date: input.date ?? null,
      startDate: input.startDate ?? null,
      endDate: input.endDate ?? null,
      selectedDays: input.selectedDays ?? [],
      created_by: userId,
      created_at: new Date(),
    });

    await schedule.save();
    return { message: 'Schedule created successfully' };
  }

  async editSchedule(input: EditScheduleInput) {
    const existing = await this.scheduleModel.findById(input.scheduleId);
    if (!existing) throw new NotFoundException('Schedule not found');

    let courseId = existing.course;

    if (input.courseCode) {
      const course = await this.courseModel.findOne({
        courseCode: input.courseCode,
      });
      if (!course)
        throw new NotFoundException(`Course "${input.courseCode}" not found`);
      courseId = course._id;
    }

    // No overlap blocking — frontend warns the user and they choose to proceed.
    await this.scheduleModel.findByIdAndUpdate(
      input.scheduleId,
      {
        course: courseId,
        ...(input.location && { location: input.location }),
        ...(input.startTime && { start_time: input.startTime }),
        ...(input.endTime && { end_time: input.endTime }),
        ...(input.color && { color: input.color }),
        ...(input.reminder !== undefined && { reminder: input.reminder }),
        ...(input.recurrenceType && { recurrence_type: input.recurrenceType }),
        ...(input.date && { date: input.date }),
        ...(input.startDate && { startDate: input.startDate }),
        ...(input.endDate && { endDate: input.endDate }),
        ...(input.selectedDays && { selectedDays: input.selectedDays }),
      },
      { new: true },
    );

    return { message: 'Schedule updated successfully' };
  }

  async deleteSchedule(input: DeleteScheduleInput) {
    const deleted = await this.scheduleModel.findByIdAndDelete(
      input.scheduleId,
    );
    if (!deleted) {
      throw new NotFoundException('Schedule not found');
    }
    return { message: 'Schedule deleted successfully' };
  }

  async getAllSchedules() {
    const schedules = await this.scheduleModel
      .find()
      .populate('course', 'courseCode')
      .sort({ created_at: -1 })
      .exec();

    return schedules.map((s) => {
      const course = s.course as unknown as CourseDoc;
      return this.mapSchedule(s, course?.courseCode ?? '');
    });
  }

  async getSchedulesByCourse(courseCode: string) {
    const course = await this.courseModel.findOne({ courseCode });
    if (!course) {
      throw new NotFoundException(`Course "${courseCode}" not found`);
    }

    const schedules = await this.scheduleModel
      .find({ course: course._id })
      .sort({ created_at: -1 })
      .exec();

    return schedules.map((s) => {
      return this.mapSchedule(s, courseCode ?? '');
    });
  }

  async getMySchedules(userId: string) {
    const schedules = await this.scheduleModel
      .find({ created_by: userId })
      .populate('course', 'courseCode')
      .sort({ created_at: -1 })
      .exec();

    return schedules.map((s) => {
      const course = s.course as unknown as CourseDoc;
      return this.mapSchedule(s, course?.courseCode ?? '');
    });
  }

  async getEnrolledSchedules(userId: string) {
    // 1. Find every course this user is subscribed to.
    const enrolledCourses = await this.courseModel
      .find({ subscribers: userId })
      .select('_id courseCode')
      .exec();

    if (enrolledCourses.length === 0) return [];

    const courseIds = enrolledCourses.map((c) => c._id);
    const courseCodeMap = new Map(
      enrolledCourses.map((c) => [c._id.toString(), c.courseCode]),
    );

    // 2. Fetch all schedules whose `course` field is one of those ids.
    const schedules = await this.scheduleModel
      .find({ course: { $in: courseIds } })
      .sort({ created_at: -1 })
      .exec();

    // 3. Map using the same private helper already in the service.
    return schedules.map((s) => {
      const courseCode = courseCodeMap.get(s.course?.toString() ?? '') ?? '';
      return this.mapSchedule(s, courseCode);
    });
  }
}
