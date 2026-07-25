import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class AssessmentsType {
  @Field()
  assessmentName!: string;

  @Field()
  courseCode!: string;

  @Field({ nullable: true })
  guide?: string;

  @Field({ nullable: true })
  icon?: string;

  @Field({ nullable: true })
  color?: string;

  @Field({ nullable: true })
  imageBase64?: string;

  @Field({ defaultValue: false })
  isHidden!: boolean;

  @Field()
  createdBy!: string;

  @Field()
  createdAt!: Date;
}

