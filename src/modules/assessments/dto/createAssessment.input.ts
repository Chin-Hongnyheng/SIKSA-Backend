import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateAssessmentInput {
  @Field()
  courseCode!: string;

  @Field()
  assessmentName!: string;

  @Field({ nullable: true })
  guide?: string;
}
