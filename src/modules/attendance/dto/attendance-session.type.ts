import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AttendanceSessionType {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => String)
  courseCode!: string;

  @Field(() => String)
  createdBy!: string;

  @Field(() => String)
  title!: string;

  @Field(() => String)
  date!: string;

  @Field(() => String)
  startTime!: string;

  @Field(() => String)
  endTime!: string;

  @Field(() => String)
  password!: string;

  @Field(() => String, { nullable: true })
  passwordExpiresAt?: string | null;

  @Field(() => Int)
  passwordRefreshSeconds!: number;

  @Field(() => Int)
  lateAfterMinutes!: number;

  @Field(() => Boolean)
  isActive!: boolean;
}
