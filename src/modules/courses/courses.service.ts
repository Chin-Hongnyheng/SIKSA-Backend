import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CourseDoc } from './courses.schema';
import { ScheduleDoc } from '../schedules/schedules.schema';
import { UserDoc } from '../auth/users.schema';
import { CreateCourseInput } from './dto/createCourse.input';
import { EditCourseInput } from './dto/editCourse.input';
import { DeleteCourseInput } from './dto/deleteCourse.input';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel('Course') private readonly courseModel: Model<CourseDoc>,
    @InjectModel('Schedule') private readonly scheduleModel: Model<ScheduleDoc>,
    @InjectModel('User') private readonly userModel: Model<UserDoc>,
    private notificationsService: NotificationsService,
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
        : typeof creator === 'string'
          ? creator
          : 'Unknown';

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
      courseImg: c.course_img ?? null,
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
      course_img: input.course_img ?? null,
      created_by: userId,
      subscribers: [],
      created_at: new Date(),
    });

    await course.save();
    return { message: 'Course created successfully' };
  }

  async editCourse(input: EditCourseInput) {
    const existingCourse = await this.courseModel.findOne({
      courseCode: input.courseCode,
    });

    if (!existingCourse) {
      throw new NotFoundException(
        `Course with code "${input.courseCode}" not found`,
      );
    }

    const course = await this.courseModel.findOneAndUpdate(
      { courseCode: input.courseCode },
      {
        ...(input.courseName && { courseName: input.courseName }),
        ...(input.newCourseCode && { courseCode: input.newCourseCode }),
        ...(input.description !== undefined && {
          description: input.description,
        }),
        ...(input.course_img !== undefined && { course_img: input.course_img }),
      },
      { new: true },
    );

    if (!course) {
      throw new NotFoundException(
        `Course with code "${input.courseCode}" not found`,
      );
    }

    // Fire-and-forget: notification failures should never block the edit.
    this.notifySubscribersOfCourseUpdate(course).catch(() => {});

    return { message: 'Course updated successfully' };
  }

  async deleteCourse(input: DeleteCourseInput) {
    const course = await this.courseModel.findOne({
      courseCode: input.courseCode,
    });

    if (!course) {
      throw new NotFoundException(
        `Course with code "${input.courseCode}" not found`,
      );
    }

    await this.scheduleModel.deleteMany({ course: course._id });
    await this.courseModel.findByIdAndDelete(course._id);

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

    // Fire-and-forget: notification failures should never block subscribe.
    this.notifyOwnerOfNewSubscriber(course, userId).catch(() => {});

    return { message: 'Course subscribed successfully' };
  }

  /**
   * Sends a push notification to the course creator letting them know
   * `{userName} joined {courseName}`. The exact join time is sent as an
   * ISO timestamp (`joinedAt`) in the data payload — NOT pre-formatted
   * here — so the client can render it in the viewer's own local
   * timezone instead of the server's timezone.
   */
  private async notifyOwnerOfNewSubscriber(
    course: CourseDoc,
    subscriberId: string,
  ) {
    // Don't notify a teacher who "joins" their own course.
    if (course.created_by?.toString() === subscriberId) return;

    const [owner, subscriber] = await Promise.all([
      this.userModel.findById(course.created_by),
      this.userModel.findById(subscriberId),
    ]);

    if (!owner || !owner.fcmToken || !subscriber) return;

    await this.notificationsService.sendToToken(owner.fcmToken, {
      title: 'New student joined',
      body: `${subscriber.userName} joined "${course.courseName}"`,
      data: {
        screen: 'courseDetail',
        courseCode: course.courseCode,
        joinedAt: new Date().toISOString(),
      },
    });
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

  async updateCourseImage(courseCode: string, imageUrl: string) {
    const course = await this.courseModel.findOneAndUpdate(
      { courseCode },
      { course_img: imageUrl },
      { new: true },
    );
    if (!course) {
      throw new NotFoundException(`Course with code "${courseCode}" not found`);
    }
    return course;
  }

  /**
   * Sends a push notification to every subscriber of a course letting
   * them know the teacher updated it. Skips subscribers without an
   * fcmToken (no device registered) silently.
   */
  private async notifySubscribersOfCourseUpdate(course: CourseDoc) {
    const subscriberIds = (course.subscribers ?? []).map((s: any) =>
      s?.toString(),
    );

    if (subscriberIds.length === 0) return;

    const subscribers = await this.userModel.find({
      _id: { $in: subscriberIds },
      fcmToken: { $exists: true, $ne: null },
    });

    if (subscribers.length === 0) return;

    await Promise.all(
      subscribers.map((subscriber) =>
        this.notificationsService
          .sendToToken(subscriber.fcmToken!, {
            title: 'Course updated',
            body: `"${course.courseName}" was updated`,
            data: {
              screen: 'courseDetail',
              courseCode: course.courseCode,
              updatedAt: new Date().toISOString(),
            },
          })
          .catch(() => {}),
      ),
    );
  }
}
