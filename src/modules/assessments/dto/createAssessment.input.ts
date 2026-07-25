import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateAssessmentInput {
  @Field()
  courseCode!: string;

  @Field()
  assessmentName!: string;

  @Field({ nullable: true })
  guide?: string;

  @Field({ nullable: true })
  icon?: string;

  @Field({ nullable: true })
  color?: string;

  @Field({ nullable: true })
  imageBase64?: string;
}

