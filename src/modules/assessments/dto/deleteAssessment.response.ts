import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class DeleteAssessmentResponse {
  @Field()
  message!: string;
}
