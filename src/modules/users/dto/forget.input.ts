import { InputType, Field } from '@nestjs/graphql'

@InputType()
export class CreateForgetInput {
    @Field()
    email: string;

    @Field()
    newPassword: string;

    @Field()
    confirmPassword: string;
}