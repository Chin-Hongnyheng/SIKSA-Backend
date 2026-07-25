import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class DeleteAssessmentFolderResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
}

@ObjectType()
export class ReorderAssessmentFoldersResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
}
