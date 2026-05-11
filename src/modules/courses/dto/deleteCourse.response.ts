import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class DeleteCourseResponse {
  @Field()
  message!: string;
}
