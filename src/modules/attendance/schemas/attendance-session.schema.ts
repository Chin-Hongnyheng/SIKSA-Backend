import { Field, ID, ObjectType, GraphQLISODateTime, Int } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AttendanceSessionDocument = HydratedDocument<AttendanceSession>;

@ObjectType()
@Schema({ timestamps: true, collection: 'attendance_sessions' })
export class AttendanceSession {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => String)
  @Prop({ type: String, required: true })
  courseId!: string;

  @Field(() => String)
  @Prop({ type: String, required: true })
  teacherId!: string;

  @Field(() => String)
  @Prop({ type: String, required: true })
  title!: string;

  @Field(() => String)
  @Prop({ type: String, required: true })
  date!: string;

  @Field(() => String)
  @Prop({ type: String, required: true })
  startTime!: string;

  @Field(() => String)
  @Prop({ type: String, required: true })
  endTime!: string;

  @Field(() => String)
  @Prop({ type: String, required: true })
  password!: string;

  @Field(() => GraphQLISODateTime)
  @Prop({ type: Date, required: true })
  passwordExpiresAt!: Date;

  @Field(() => Int)
  @Prop({ type: Number, default: 60 })
  passwordRefreshSeconds!: number;

  @Field(() => Int)
  @Prop({ type: Number, default: 15 })
  lateAfterMinutes!: number;

  @Field(() => Boolean)
  @Prop({ type: Boolean, default: true })
  isActive!: boolean;
}

export const AttendanceSessionSchema =
  SchemaFactory.createForClass(AttendanceSession);