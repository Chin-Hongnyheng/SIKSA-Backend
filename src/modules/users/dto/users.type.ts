import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class UserType {
  @Field(() => ID)
  id: string;

  @Field()
  userName: string;

  @Field()
  email: string;

  @Field()
  phone: number;

  @Field()
  role: string;
}