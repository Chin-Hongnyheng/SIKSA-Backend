import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class EditScheduleInput {
  @Field()
  scheduleId!: string;

  @Field({ nullable: true })
  courseCode?: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  startTime?: Date;

  @Field({ nullable: true })
  endTime?: Date;

  @Field({ nullable: true })
  color?: string;

  @Field({ nullable: true })
  reminder?: number;

  @Field({ nullable: true })
  recurrenceType?: string;

  @Field({ nullable: true })
  date?: Date;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field(() => [String], { nullable: true })
  selectedDays?: string[];
}
