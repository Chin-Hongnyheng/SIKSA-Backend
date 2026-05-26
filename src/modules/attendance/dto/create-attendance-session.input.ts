import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateAttendanceSessionInput {
  @Field(() => String)
  courseId!: string;

  @Field(() => String)
  teacherId!: string;

  @Field(() => String)
  title!: string;

  @Field(() => String)
  date!: string;

  @Field(() => String)
  startTime!: string;

  @Field(() => String, { nullable: true })
  endTime?: string | null;

  @Field(() => Int, { nullable: true })
  passwordRefreshSeconds?: number;

  @Field(() => Int, { nullable: true })
  lateAfterMinutes?: number;
}