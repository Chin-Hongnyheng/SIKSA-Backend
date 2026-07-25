import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class UpsertGradeResponse {
  @Field()
  message!: string;
}
