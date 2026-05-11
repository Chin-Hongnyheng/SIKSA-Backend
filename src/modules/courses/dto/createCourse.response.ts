import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class CreateCourseResponse {
  @Field()
  message!: string;
}
