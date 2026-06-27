import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AssessmentFolderDoc } from './assessment-folders.schema';
import { CreateAssessmentFolderInput, UpdateAssessmentFolderInput } from './dto/assessment-folders.input';

@Injectable()
export class AssessmentFoldersService {
  constructor(
    @InjectModel('AssessmentFolder')
    private readonly folderModel: Model<AssessmentFolderDoc>,
  ) {}

  async createFolder(
    input: CreateAssessmentFolderInput,
    userId: string,
  ): Promise<AssessmentFolderDoc> {
    // Find highest order
    const lastFolder = await this.folderModel
      .findOne({ user: userId })
      .sort({ order: -1 })
      .exec();

    const order = lastFolder ? lastFolder.order + 1 : 0;

    const folder = new this.folderModel({
      ...input,
      user: userId,
      order,
    });

    return folder.save();
  }

  async getMyFolders(userId: string): Promise<AssessmentFolderDoc[]> {
    return this.folderModel.find({ user: userId }).sort({ order: 1 }).exec();
  }

  async updateFolder(
    input: UpdateAssessmentFolderInput,
    userId: string,
  ): Promise<AssessmentFolderDoc> {
    const folder = await this.folderModel.findById(input.id);
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }
    if (folder.user.toString() !== userId) {
      throw new ForbiddenException('Not authorized to update this folder');
    }

    if (input.name !== undefined) folder.name = input.name;
    if (input.colorHex !== undefined) folder.colorHex = input.colorHex;
    if (input.assessmentKeys !== undefined) folder.assessmentKeys = input.assessmentKeys;

    return folder.save();
  }

  async deleteFolder(id: string, userId: string): Promise<boolean> {
    const folder = await this.folderModel.findById(id);
    if (!folder) {
      throw new NotFoundException('Folder not found');
    }
    if (folder.user.toString() !== userId) {
      throw new ForbiddenException('Not authorized to delete this folder');
    }

    await folder.deleteOne();
    return true;
  }

  async reorderFolders(folderIds: string[], userId: string): Promise<boolean> {
    // We get the list of folder IDs in the new order.
    // Update each folder's order field.
    const bulkOps = folderIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, user: userId },
        update: { $set: { order: index } },
      },
    }));

    if (bulkOps.length > 0) {
      await this.folderModel.bulkWrite(bulkOps);
    }
    return true;
  }
}
