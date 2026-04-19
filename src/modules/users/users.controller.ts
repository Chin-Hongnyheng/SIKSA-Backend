import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UsePipes,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateLoginInput } from './dto/login.input';
import { JoiValidationPipe } from '../../common/joi-validation.pipe';
import { CreateUserSchema } from './schemas/create-user.schema';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @UsePipes(new JoiValidationPipe(CreateUserSchema))
  create(@Body() input: CreateLoginInput) {
    return this.usersService.create(input);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() input: Partial<CreateLoginInput>,
  ) {
    return this.usersService.update(id, input);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.delete(id);
  }
}