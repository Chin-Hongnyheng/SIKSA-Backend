import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class DeleteAssessmentInput {
  @Field()
  assessmentName!: string;

  @Field()
  courseCode!: string;
}
