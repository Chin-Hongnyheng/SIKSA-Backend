import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { PermissionsGuard } from '../../guards/permissions.guard';
import { Roles } from '../../decorators/roles.decorator';
import { Permissions } from '../../decorators/permissions.decorator';
import { CreateScheduleInput } from './dto/createSchedule.input';
import { CreateScheduleResponse } from './dto/createSchedule.response';
import { EditScheduleInput } from './dto/editSchedule.input';
import { EditScheduleResponse } from './dto/editSchedule.response';
import { DeleteScheduleInput } from './dto/deleteSchedule.input';
import { DeleteScheduleResponse } from './dto/deleteSchedule.response';
import { Schedule } from './dto/schedule.type';

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
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class SchedulesResolver {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Roles('Teacher', 'Admin')
  @Permissions('schedule:create')
  @Mutation(() => CreateScheduleResponse)
  createSchedule(
    @Args('input') input: CreateScheduleInput,
    @Context() context: any,
  ) {
    const userId = extractUserId(context);
    return this.schedulesService.createSchedule(input, userId);
  }

  @Roles('Teacher', 'Admin')
  @Permissions('schedule:edit')
  @Mutation(() => EditScheduleResponse)
  editSchedule(@Args('input') input: EditScheduleInput) {
    return this.schedulesService.editSchedule(input);
  }

  @Roles('Teacher', 'Admin')
  @Permissions('schedule:delete')
  @Mutation(() => DeleteScheduleResponse)
  deleteSchedule(@Args('input') input: DeleteScheduleInput) {
    return this.schedulesService.deleteSchedule(input);
  }

  @Roles('Student', 'Teacher', 'Admin')
  @Permissions('schedule:view')
  @Query(() => [Schedule])
  getAllSchedules() {
    return this.schedulesService.getAllSchedules();
  }

  // get schedules under a specific course
  @Roles('Student', 'Teacher', 'Admin')
  @Permissions('schedule:view')
  @Query(() => [Schedule])
  getSchedulesByCourse(@Args('courseCode') courseCode: string) {
    return this.schedulesService.getSchedulesByCourse(courseCode);
  }

  // get schedules created by logged-in user
  @Roles('Teacher', 'Admin')
  @Permissions('schedule:view')
  @Query(() => [Schedule])
  getMySchedules(@Context() context: any) {
    const userId = extractUserId(context);
    return this.schedulesService.getMySchedules(userId);
  }
}
