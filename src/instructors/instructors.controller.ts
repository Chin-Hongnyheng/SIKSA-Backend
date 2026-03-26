import { Controller, Get, Post, Body, Param, Put, Delete, UsePipes } from '@nestjs/common';
import { InstructorsService } from './instructors.service';
import { CreateInstructorInput } from './dto/create-instructor.input';
import { JoiValidationPipe } from '../common/joi-validation.pipe';
import { CreateInstructorSchema } from './schemas/create-instructor.schema';

@Controller('instructors')
export class InstructorsController {
  constructor(private readonly instructorsService: InstructorsService) {}

  @Post()
  @UsePipes(new JoiValidationPipe(CreateInstructorSchema))
  create(@Body() createInstructorInput: CreateInstructorInput) {
    return this.instructorsService.create(createInstructorInput);
  }

  @Get()
  findAll() {
    return this.instructorsService.findAll();
  }

  @Get(':instructorId')
  findOne(@Param('instructorId') instructorId: string) {
    return this.instructorsService.findOne(instructorId);
  }

  @Put(':instructorId')
  update(
    @Param('instructorId') instructorId: string,
    @Body() updateInstructorInput: Partial<CreateInstructorInput>,
  ) {
    return this.instructorsService.update(instructorId, updateInstructorInput);
  }

  @Delete(':instructorId')
  remove(@Param('instructorId') instructorId: string) {
    return this.instructorsService.delete(instructorId);
  }
}