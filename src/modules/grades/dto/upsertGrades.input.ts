import { InputType, Field } from '@nestjs/graphql';
import { UpsertGradeInput } from './upsertGrade.input';

@InputType()
export class UpsertGradesInput {
  @Field(() => [UpsertGradeInput])
  grades!: UpsertGradeInput[];
}
