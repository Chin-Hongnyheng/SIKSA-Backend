import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class RegisterResponse {
  @Field()
  message!: string;

  @Field()
  accessToken!: string;

  @Field()
  refreshToken!: string;
}
