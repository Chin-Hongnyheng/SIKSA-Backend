import { Resolver, Mutation, Args, Query, Context, Int } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Permissions } from '../../decorators/permissions.decorator';
import { CreateCourseInput } from './dto/createCourse.input';
import { CreateCourseResponse } from './dto/createCourse.response';
import { EditCourseInput } from './dto/editCourse.input';
import { EditCourseResponse } from './dto/editCourse.response';
import { DeleteCourseInput } from './dto/deleteCourse.input';
import { DeleteCourseResponse } from './dto/deleteCourse.response';
import { CoursesType, CourseSubscriberType } from './dto/courses.type';

function extractUserId(context: any): string {
  const userId = context?.req?.user?.userId;
  if (!userId) {
    throw new ForbiddenException(
      'You must be logged in to perform this action',
    );
  }
  return userId;
}

@Resolver()
// Guard order matters: Jwt (authn) → Roles (coarse) → Permissions (fine-grained)
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class CoursesResolver {
  constructor(private readonly coursesService: CoursesService) {}

  @Roles('User', 'Admin')
  @Permissions('course:create')
  @Mutation(() => CreateCourseResponse)
  createCourse(
    @Args('input') input: CreateCourseInput,
    @Context() context: any,
  ) {
    const userId = extractUserId(context);
    return this.coursesService.createCourse(input, userId);
  }

  @Roles('User', 'Admin')
  @Permissions('course:edit')
  @Mutation(() => EditCourseResponse)
  editCourse(@Args('input') input: EditCourseInput) {
    return this.coursesService.editCourse(input);
  }

  @Roles('User', 'Admin')
  @Permissions('course:delete')
  @Mutation(() => DeleteCourseResponse)
  deleteCourse(@Args('input') input: DeleteCourseInput) {
    return this.coursesService.deleteCourse(input);
  }

  @Roles('User')
  @Permissions('course:subscribe')
  @Mutation(() => CreateCourseResponse)
  subscribeCourse(
    @Args('courseCode') courseCode: string,
    @Context() context: any,
  ) {
    const userId = extractUserId(context);
    return this.coursesService.subscribeCourse(courseCode, userId);
  }

  @Roles('User', 'Admin')
  @Permissions('course:view')
  @Query(() => [CoursesType])
  getAllCourses(@Context() context: any) {
    const userId = context?.req?.user?.userId;
    return this.coursesService.getAllCourses(userId);
  }

  @Roles('User', 'Admin')
  @Permissions('course:view')
  @Query(() => CoursesType)
  getCourseByCode(
    @Args('courseCode') courseCode: string,
    @Context() context: any,
  ) {
    const userId = context?.req?.user?.userId;
    return this.coursesService.getCourseByCode(courseCode, userId);
  }

  @Roles('User', 'Admin')
  @Permissions('course:view')
  @Query(() => [CoursesType])
  getMyCourses(@Context() context: any) {
    const userId = extractUserId(context);
    return this.coursesService.getMyCourses(userId);
  }

  @Roles('User', 'Admin')
  @Permissions('course:view')
  @Query(() => [CourseSubscriberType])
  getCourseSubscribers(
    @Args('courseCode') courseCode: string,
    @Context() context: any,
  ) {
    const userId = extractUserId(context);
    const role = context?.req?.user?.role;
    return this.coursesService.getCourseSubscribers(courseCode, userId, role);
  }

  @Roles('User', 'Admin')
  @Permissions('course:view')
  @Query(() => Int)
  getMyTotalStudents(@Context() context: any) {
    const userId = extractUserId(context);
    return this.coursesService.getMyTotalStudents(userId);
  }
}
