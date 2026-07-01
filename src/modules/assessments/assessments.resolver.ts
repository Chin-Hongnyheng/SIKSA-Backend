import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Permissions } from '../../decorators/permissions.decorator';
import { AssessmentsService } from './assessments.service';
import { CreateAssessmentInput } from './dto/createAssessment.input';
import { CreateAssessmentResponse } from './dto/createAssessment.response';
import { DeleteAssessmentInput } from './dto/deleteAssessment.input';
import { DeleteAssessmentResponse } from './dto/deleteAssessment.response';
import { AssessmentsType } from './dto/assessments.type';

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
export class AssessmentsResolver {
  constructor(private readonly assessmentService: AssessmentsService) {}

  @Roles('User', 'Admin')
  @Permissions('assessment:create')
  @Mutation(() => CreateAssessmentResponse)
  createAssessment(
    @Args('input') input: CreateAssessmentInput,
    @Context() context: any,
  ) {
    const { userId } = extractUser(context);
    return this.assessmentService.createAssessment(input, userId);
  }

  @Roles('User', 'Admin')
  @Permissions('assessment:delete')
  @Mutation(() => DeleteAssessmentResponse)
  deleteAssessment(
    @Args('input') input: DeleteAssessmentInput,
    @Context() context: any,
  ) {
    const { userId, role } = extractUser(context);
    return this.assessmentService.deleteAssessment(input, userId, role);
  }

  @Roles('User', 'Admin')
  @Permissions('assessment:view')
  @Query(() => [AssessmentsType])
  getAssessmentsByCourseCode(
    @Args('courseCode') courseCode: string,
    @Context() context: any,
  ) {
    const { userId, role } = extractUser(context);
    return this.assessmentService.getAssessmentsByCourseCode(
      courseCode,
      userId,
      role,
    );
  }

  @Roles('User', 'Admin')
  @Permissions('assessment:view')
  @Query(() => [AssessmentsType])
  getAllMyAssessments(@Context() context: any) {
    const { userId, role } = extractUser(context);
    return this.assessmentService.getAllMyAssessments(userId, role);
  }
}
