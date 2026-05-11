import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
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
import { CoursesType } from './dto/courses.type';

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

  @Roles('Teacher', 'Admin')
  @Permissions('course:create')
  @Mutation(() => CreateCourseResponse)
  createCourse(
    @Args('input') input: CreateCourseInput,
    @Context() context: any,
  ) {
    const userId = extractUserId(context);
    return this.coursesService.createCourse(input, userId);
  }

  @Roles('Teacher', 'Admin')
  @Permissions('course:edit')
  @Mutation(() => EditCourseResponse)
  editCourse(@Args('input') input: EditCourseInput) {
    return this.coursesService.editCourse(input);
  }

  @Roles('Teacher', 'Admin')
  @Permissions('course:delete')
  @Mutation(() => DeleteCourseResponse)
  deleteCourse(@Args('input') input: DeleteCourseInput) {
    return this.coursesService.deleteCourse(input);
  }

  @Roles('Student', 'Admin')
  @Permissions('course:view')
  @Query(() => [CoursesType])
  getAllCourses() {
    return this.coursesService.getAllCourses();
  }
  @Roles('Student', 'Admin')
  @Permissions('course:view')
  @Query(() => CoursesType)
  getCourseByCode(@Args('courseCode') courseCode: string) {
    return this.coursesService.getCourseByCode(courseCode);
  }

  @Roles('Teacher', 'Admin')
  @Permissions('course:view')
  @Query(() => [CoursesType])
  getMyCourses(@Context() context: any) {
    const userId = context?.req?.user?.userId;
    return this.coursesService.getMyCourses(userId);
  }
}
