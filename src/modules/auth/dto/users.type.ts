import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class UserType {
  @Field(() => ID)
  id!: string;

  @Field()
  userName!: string;

  @Field()
  email!: string;

  @Field()
  phone!: number;

  @Field()
  role!: string;

  @Field()
  dob!: Date;

  @Field()
  gender!: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  photo_url?: string;

  @Field()
  notification!: string;

  @Field()
  language!: string;
}
