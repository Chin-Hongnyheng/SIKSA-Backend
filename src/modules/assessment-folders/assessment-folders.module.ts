import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { assessmentFolderSchema } from './assessment-folders.schema';
import { AssessmentFoldersService } from './assessment-folders.service';
import { AssessmentFoldersResolver } from './assessment-folders.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'AssessmentFolder', schema: assessmentFolderSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
    }),
  ],
  providers: [AssessmentFoldersService, AssessmentFoldersResolver],
  exports: [AssessmentFoldersService],
})
export class AssessmentFoldersModule {}
