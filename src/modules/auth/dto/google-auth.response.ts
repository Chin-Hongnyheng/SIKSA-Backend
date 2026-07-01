import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class GoogleAuthResponse {
  @Field()
  accessToken!: string;

  @Field()
  refreshToken!: string;
}
