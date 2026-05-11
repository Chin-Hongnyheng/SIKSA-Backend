import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateLoginInput {
  @Field()
  email!: string;

  @Field()
  password!: string;
}
