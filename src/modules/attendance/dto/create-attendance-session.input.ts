import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateAttendanceSessionInput {
  @Field(() => String)
  courseCode!: string;

  @Field(() => String)
  title!: string;

  @Field(() => String)
  date!: string;

  @Field(() => String)
  startTime!: string;

  @Field(() => String)
  endTime!: string;

  @Field(() => Int, { nullable: true })
  passwordRefreshSeconds?: number;

  @Field(() => Int, { nullable: true })
  lateAfterMinutes?: number;
}
