import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AttendanceSummary {
  @Field(() => Int)
  earlyLeave!: number;

  @Field(() => Int)
  absents!: number;

  @Field(() => Int)
  late!: number;

  @Field(() => Int)
  permission!: number;
}