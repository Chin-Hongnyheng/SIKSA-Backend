import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class GoogleAuthInput {
  @Field()
  idToken!: string;

  @Field()
  role!: string;
}
