import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class InstructorType {
  @Field(() => ID)
  instructorId: string;

  @Field()
  instructorName: string;

  @Field()
  email: string;

  @Field(() => Int)
  phone: number;

  @Field()
  password: string;

  @Field(() => Date, { nullable: true })
  dob?: Date;

  @Field({ nullable: true })
  gender?: 'male' | 'female' | 'other';

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  photo_url?: string;

  @Field(() => Int, { nullable: true })
  year?: number;

  @Field(() => Date)
  created_at: Date;
}