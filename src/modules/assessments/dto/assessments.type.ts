import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class AssessmentsType {
  @Field()
  assessmentName!: string;

  @Field()
  courseCode!: string;

  @Field({ nullable: true })
  guide?: string;

  @Field()
  createdBy!: string;

  @Field()
  createdAt!: Date;
}
