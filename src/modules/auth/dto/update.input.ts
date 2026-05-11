import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  userName?: string;

  @Field({ nullable: true })
  dob?: Date;

  @Field({ nullable: true })
  gender?: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  photo_url?: string;

  @Field({ nullable: true })
  notification?: string;

  @Field({ nullable: true })
  language?: string;
}
