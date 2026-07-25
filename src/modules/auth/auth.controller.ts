import {
  Controller,
  Patch,
  Param,
  UploadedFile,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { storage } from '../../common/cloudinary/cloudinary';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Patch('users/:id/photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('photo', { storage }))
  async uploadPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const photoUrl = file.path;
    const user = await this.authService.updatePhoto(id, photoUrl);
    return { photo_url: photoUrl, user };
  }
}
