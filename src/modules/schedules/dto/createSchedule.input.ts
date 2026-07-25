import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateScheduleInput {
  @Field()
  courseCode!: string;

  @Field()
  location!: string;

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
}
