import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateRegisterInput {
  @Field()
  userName: string;

  @Field()
  email: string;

  @Field()
  phone: number;

  @Field()
  password: string;

  @Field()
  confirmPassword: string;

  @Field({ nullable: true })
  role?: string;
}