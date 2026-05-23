import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class DeleteScheduleInput {
  @Field()
  scheduleId!: string;
}
