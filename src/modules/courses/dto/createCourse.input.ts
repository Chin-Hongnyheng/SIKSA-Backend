import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateCourseInput {
  @Field()
  courseName!: string;

  @Field()
  courseCode!: string;

  @Field({ nullable: true })
  description?: string;
}
