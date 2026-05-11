import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class CoursesType {
  @Field()
  courseName!: string;

  @Field()
  courseCode!: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  createdBy!: string;

  @Field()
  createdAt!: Date;
}
