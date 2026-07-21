import { InputType, Field, Float } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  userName?: string;

  @Field(() => Float, { nullable: true })
  phone?: number;

  @Field({ nullable: true })
  dob?: Date;

  @Field({ nullable: true })
  gender?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  photo_url?: string;

  @Field({ nullable: true })
  fcmToken?: string;

  // @Field({ nullable: true })
  // notification?: string;

  // @Field({ nullable: true })
  // language?: string;
}
