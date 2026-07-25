import { InputType, Field, Float } from '@nestjs/graphql';

@InputType()
export class CreateRegisterInput {
  @Field()
  userName!: string;

  @Field()
  email!: string;

  @Field(() => Float, { nullable: true })
  phone?: number;

  @Field()
  password!: string;

  @Field()
  confirmPassword!: string;

  @Field({ nullable: true })
  role?: 'User' | 'Admin';

  @Field({ nullable: true })
  dob?: Date;

  @Field({ nullable: true })
  gender?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  photo_url?: string;

  // @Field({ defaultValue: 'ON' })
  // notification?: string;

  // @Field({ defaultValue: 'ENGLISH' })
  // language?: string;
}
