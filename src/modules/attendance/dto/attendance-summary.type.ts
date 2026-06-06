import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AttendanceSummary {
  @Field(() => Int)
  present!: number;

  @Field(() => Int)
  late!: number;

  @Field(() => Int)
  absent!: number;

  @Field(() => Int)
  permission!: number;
}