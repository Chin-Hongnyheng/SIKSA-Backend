import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class EditCourseInput {
  @Field({ nullable: true })
  courseName?: string;

  @Field()
  courseCode!: string;

  @Field({ nullable: true })
  newCourseCode?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  course_img?: string;

  @Field({ nullable: true })
  colorHex?: string;
}
