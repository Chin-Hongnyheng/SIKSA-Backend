import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Schedule {
  @Field()
  scheduleId!: string;

  @Field()
  courseCode!: string;

  @Field({ nullable: true })
  location?: string;

  @Field()
  startTime!: Date;

  @Field()
  endTime!: Date;

  @Field({ nullable: true })
  color?: string;

  @Field({ nullable: true })
  reminder?: number;

  @Field()
  recurrenceType!: string;

  @Field({ nullable: true })
  date?: Date;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field(() => [String], { nullable: true })
  selectedDays?: string[];

  @Field()
  createdBy!: string;

  @Field()
  createdAt!: Date;
}
