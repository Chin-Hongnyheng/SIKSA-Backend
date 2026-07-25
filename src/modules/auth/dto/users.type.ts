import { ObjectType, Field, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class UserType {
  @Field(() => ID)
  id!: string;

  @Field()
  userName!: string;

  @Field()
  email!: string;

  @Field(() => Float, { nullable: true })
  phone?: number;

  @Field()
  role!: string;

  @Field(() => Date, { nullable: true })
  dob?: Date;

  @Field(() => String, { nullable: true })
  gender?: string;

  @Field(() => String, { nullable: true })
  address?: string;

  @Field(() => String, { nullable: true })
  photo_url?: string;

  @Field(() => String, { nullable: true })
  notification?: string;

  @Field(() => String, { nullable: true })
  language?: string;
}
