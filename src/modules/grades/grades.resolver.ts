import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Permissions } from '../../decorators/permissions.decorator';
import { GradesService } from './grades.service';
import { UpsertGradeInput } from './dto/upsertGrade.input';
import { UpsertGradesInput } from './dto/upsertGrades.input';
import { UpsertGradeResponse } from './dto/upsertGrade.response';
import { GradeType } from './dto/grade.type';

function extractUser(context: any): { userId: string; role: string } {
  const user = context?.req?.user;
  const userId = user?.userId;
  if (!userId) {
    throw new ForbiddenException(
      'You must be logged in to perform this action',
    );
  }
  return { userId, role: user?.role ?? '' };
}

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Resolver()
export class GradesResolver {
  constructor(private readonly gradesService: GradesService) { }

  @Roles('Teacher', 'Admin')
  @Permissions('grade:upsert')
  @Mutation(() => UpsertGradeResponse)
  upsertGrade(
    @Args('input') input: UpsertGradeInput,
    @Context() context: any,
  ) {
    const { userId, role } = extractUser(context);
    return this.gradesService.upsertGrade(input, userId, role);
  }

  @Roles('Teacher', 'Admin')
  @Permissions('grade:upsert')
  @Mutation(() => UpsertGradeResponse)
  upsertGrades(
    @Args('input') input: UpsertGradesInput,
    @Context() context: any,
  ) {
    const { userId, role } = extractUser(context);
    return this.gradesService.upsertGrades(input, userId, role);
  }

  @Roles('Teacher', 'Admin')
  @Permissions('grade:view')
  @Query(() => [GradeType])
  getGradesByCourse(
    @Args('courseCode') courseCode: string,
    @Context() context: any,
  ) {
    const { userId, role } = extractUser(context);
    return this.gradesService.getGradesByCourse(courseCode, userId, role);
  }
}
