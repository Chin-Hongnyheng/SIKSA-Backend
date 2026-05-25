import { Field, InputType } from '@nestjs/graphql';

@InputType('MarkAttendanceInput')
export class MarkAttendanceInput {
  @Field(() => String)
  studentId!: string;

  @Field(() => String)
  courseId!: string;

  @Field(() => String, { nullable: true })
  sessionId?: string | null;

  @Field(() => String)
  date!: string;

  @Field(() => String)
  status!: string;

  @Field(() => String, { nullable: true })
  checkIn?: string | null;

  @Field(() => String, { nullable: true })
  checkOut?: string | null;
}