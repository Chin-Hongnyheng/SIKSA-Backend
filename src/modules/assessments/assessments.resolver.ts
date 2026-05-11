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

function extractUserId(context: any): string {
  const userId = context?.req?.user?.userId;
  if (!userId) {
    throw new ForbiddenException(
      'You must be logged in to perform this action',
    );
  }
  return userId;
}

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Resolver()
export class AssessmentsResolver {
  constructor(private readonly assessmentService: AssessmentsService) {}

  @Roles('Teacher', 'Admin')
  @Permissions('assessment:create')
  @Mutation(() => CreateAssessmentResponse)
  createAssessment(
    @Args('input') input: CreateAssessmentInput,
    @Context() context: any,
  ) {
    const userId = extractUserId(context);
    return this.assessmentService.createAssessment(input, userId);
  }

  @Roles('Teacher', 'Admin')
  @Permissions('assessment:delete')
  @Mutation(() => DeleteAssessmentResponse)
  deleteAssessment(@Args('input') input: DeleteAssessmentInput) {
    return this.assessmentService.deleteAssessment(input);
  }

  @Roles('Teacher', 'Admin')
  @Permissions('assessment:view')
  @Query(() => [AssessmentsType])
  getAssessmentsByCourseCode(@Args('courseCode') courseCode: string) {
    return this.assessmentService.getAssessmentsByCourseCode(courseCode);
  }

  @Roles('Teacher', 'Admin')
  @Permissions('assessment:view')
  @Query(() => [AssessmentsType])
  getAllMyAssessments(@Context() context: any) {
    const userId = extractUserId(context);
    return this.assessmentService.getAllMyAssessments(userId);
  }
}
