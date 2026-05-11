import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class EditCourseResponse {
  @Field()
  message!: string;
}
