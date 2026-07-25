import { InputType, Field, Float } from '@nestjs/graphql';

@InputType()
export class UpsertGradeInput {
  @Field()
  studentId!: string;

  @Field()
  courseCode!: string;

  @Field()
  assessmentName!: string;

  @Field(() => Float)
  score!: number;

  @Field(() => Float, { nullable: true, defaultValue: 100 })
  maxScore?: number;
}
