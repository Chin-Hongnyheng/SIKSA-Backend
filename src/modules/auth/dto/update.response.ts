import { ObjectType, Field } from '@nestjs/graphql';
import { UserType } from './users.type';

@ObjectType()
export class UpdateResponse {
  @Field()
  message!: string;

  @Field(() => UserType)
  user!: UserType;
}
