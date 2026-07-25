import {
  Controller,
  Patch,
  Param,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CoursesService } from './courses.service';
import { documentStorage } from '../../common/cloudinary/cloudinary';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Patch(':courseCode/materials')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage: documentStorage }))
  async uploadCourseMaterial(
    @Param('courseCode') courseCode: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const url = file.path;
    const name = file.originalname || 'Document';
    const course = await this.coursesService.addCourseMaterial(
      courseCode,
      name,
      url,
    );
    return { message: 'Material uploaded successfully', course };
  }

  @Patch(':courseCode/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', { storage: documentStorage }))
  async uploadCourseImage(
    @Param('courseCode') courseCode: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const url = file.path;
    const course = await this.coursesService.addCourseImage(courseCode, url);
    return { message: 'Image uploaded successfully', course_img: course.course_img };
  }
}
