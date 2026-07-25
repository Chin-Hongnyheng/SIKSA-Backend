import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class GradeType {
  @Field()
  studentId!: string;

  @Field()
  studentName!: string;

  @Field()
  courseCode!: string;

  @Field()
  assessmentName!: string;

  @Field(() => Float)
  score!: number;

  @Field(() => Float)
  maxScore!: number;

  @Field()
  gradedBy!: string;

  @Field()
  gradedAt!: Date;
}
