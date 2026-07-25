import { InputType, Field, ID, Int } from '@nestjs/graphql';

@InputType()
export class CreateAssessmentFolderInput {
  @Field()
  name: string;

  @Field()
  colorHex: string;

  @Field(() => [String], { nullable: true })
  assessmentKeys?: string[];
}

@InputType()
export class UpdateAssessmentFolderInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  colorHex?: string;

  @Field(() => [String], { nullable: true })
  assessmentKeys?: string[];
}
