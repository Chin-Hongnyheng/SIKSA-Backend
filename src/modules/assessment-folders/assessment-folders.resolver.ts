import { Resolver, Mutation, Args, Query, Context } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AssessmentFoldersService } from './assessment-folders.service';
import { AssessmentFolderType } from './dto/assessment-folders.type';
import { CreateAssessmentFolderInput, UpdateAssessmentFolderInput } from './dto/assessment-folders.input';
import { DeleteAssessmentFolderResponse, ReorderAssessmentFoldersResponse } from './dto/assessment-folders.response';

function extractUserId(context: any): string {
  const userId = context?.req?.user?.userId;
  if (!userId) {
    throw new ForbiddenException('You must be logged in to perform this action');
  }
  return userId;
}

@UseGuards(JwtAuthGuard)
@Resolver()
export class AssessmentFoldersResolver {
  constructor(private readonly foldersService: AssessmentFoldersService) { }

  @Mutation(() => AssessmentFolderType)
  createAssessmentFolder(
    @Args('input') input: CreateAssessmentFolderInput,
    @Context() context: any,
  ) {
    const userId = extractUserId(context);
    return this.foldersService.createFolder(input, userId);
  }

  @Mutation(() => AssessmentFolderType)
  updateAssessmentFolder(
    @Args('input') input: UpdateAssessmentFolderInput,
    @Context() context: any,
  ) {
    const userId = extractUserId(context);
    return this.foldersService.updateFolder(input, userId);
  }

  @Mutation(() => DeleteAssessmentFolderResponse)
  async deleteAssessmentFolder(
    @Args('id') id: string,
    @Context() context: any,
  ) {
    const userId = extractUserId(context);
    await this.foldersService.deleteFolder(id, userId);
    return { success: true, message: 'Folder deleted successfully' };
  }

  @Mutation(() => ReorderAssessmentFoldersResponse)
  async reorderAssessmentFolders(
    @Args('folderIds', { type: () => [String] }) folderIds: string[],
    @Context() context: any,
  ) {
    const userId = extractUserId(context);
    await this.foldersService.reorderFolders(folderIds, userId);
    return { success: true, message: 'Folders reordered successfully' };
  }

  @Query(() => [AssessmentFolderType])
  getMyAssessmentFolders(@Context() context: any) {
    const userId = extractUserId(context);
    return this.foldersService.getMyFolders(userId);
  }
}
