import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateInstructorInput {
  @Field()
  instructorName: string;

  @Field()
  email: string;

  @Field(() => Int)
  phone: number;

  @Field()
  password: string;

  @Field({ nullable: true })
  dob?: string;

  @Field({ nullable: true })
  gender?: 'male' | 'female' | 'other';

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  photo_url?: string;

  @Field(() => Int, { nullable: true })
  year?: number;
}
