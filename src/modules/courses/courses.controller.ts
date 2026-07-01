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
import { courseStorage } from '../../common/cloudinary/cloudinary';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Patch(':courseCode/image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', { storage: courseStorage }))
  async uploadCourseImage(
    @Param('courseCode') courseCode: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imageUrl = file.path;
    const course = await this.coursesService.updateCourseImage(
      courseCode,
      imageUrl,
    );
    return { course_img: imageUrl, course };
  }
}
