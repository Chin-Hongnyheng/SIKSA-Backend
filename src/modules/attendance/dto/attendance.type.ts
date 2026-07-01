import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AttendanceType {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => String)
  studentId!: string;

  @Field(() => String, { nullable: true })
  courseCode?: string | null;

  @Field(() => String, { nullable: true })
  sessionId?: string | null;

  @Field(() => String, { nullable: true })
  date?: string | null;

  @Field(() => String, { nullable: true })
  status?: string | null;

  @Field(() => String, { nullable: true })
  checkIn?: string | null;

  @Field(() => String, { nullable: true })
  checkOut?: string | null;

  @Field(() => String, { nullable: true })
  type?: string | null;

  @Field(() => String, { nullable: true })
  time?: string | null;
}
