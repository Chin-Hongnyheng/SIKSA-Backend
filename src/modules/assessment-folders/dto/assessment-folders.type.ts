import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class AssessmentFolderType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  colorHex: string;

  @Field(() => [String])
  assessmentKeys: string[];

  @Field(() => Int)
  order: number;
}
