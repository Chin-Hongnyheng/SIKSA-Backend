import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesResolver } from './courses.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { courseSchema } from './courses.schema';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from 'src/strategies/jwt-auth.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Course', schema: courseSchema }]),
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [CoursesService, CoursesResolver, JwtStrategy],
  exports: [JwtModule],
})
export class CoursesModule {}
