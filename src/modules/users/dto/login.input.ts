import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateLoginInput {
  @Field()
  userName: string;

  @Field()
  password: string;
}
