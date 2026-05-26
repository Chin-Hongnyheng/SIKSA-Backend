import { Field, ID, ObjectType, GraphQLISODateTime } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AttendanceDocument = HydratedDocument<Attendance>;

@ObjectType()
@Schema({ timestamps: true, collection: 'attendance' })
export class Attendance {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => String)
  @Prop({ type: String, required: true })
  studentId!: string;

  @Field(() => String, { nullable: true })
  @Prop({ type: String, default: null })
  courseId?: string | null;

  @Field(() => String, { nullable: true })
  @Prop({ type: String, default: null })
  sessionId?: string | null;

  @Field(() => String, { nullable: true })
  @Prop({ type: String, default: null })
  date?: string | null;

  @Field(() => String, { nullable: true })
  @Prop({ type: String, default: null })
  status?: string | null;

  @Field(() => String, { nullable: true })
  @Prop({ type: String, default: null })
  checkIn?: string | null;

  @Field(() => String, { nullable: true })
  @Prop({ type: String, default: null })
  checkOut?: string | null;

  @Field(() => String, { nullable: true })
  @Prop({ type: String, default: null })
  type?: string | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @Prop({ type: Date, default: Date.now })
  time?: Date;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);