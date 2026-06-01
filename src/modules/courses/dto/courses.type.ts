import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class CourseSubscriberType {
  @Field()
  id!: string;

  @Field()
  userName!: string;

  @Field()
  email!: string;
}

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

  @Field(() => Int)
  subscriberCount!: number;

  @Field()
  isSubscribed!: boolean;

  @Field(() => [CourseSubscriberType])
  subscribers!: CourseSubscriberType[];
}
