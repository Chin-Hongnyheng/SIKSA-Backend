import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class DeleteScheduleResponse {
  @Field()
  message!: string;
}
