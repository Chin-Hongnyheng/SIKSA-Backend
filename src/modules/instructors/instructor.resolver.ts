import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { InstructorsService } from './instructors.service';
import { InstructorType } from './dto/instructor.type';
import { CreateInstructorInput } from './dto/create-instructor.input';

@Resolver(() => InstructorType)
export class InstructorResolver {
  constructor(private readonly instructorsService: InstructorsService) {}

  @Query(() => [InstructorType])
  async instructors(): Promise<InstructorType[]> {
    return this.instructorsService.findAll();
  }

  @Query(() => InstructorType, { nullable: true })
  async instructor(
    @Args('instructorId', { type: () => ID }) instructorId: string,
  ): Promise<InstructorType> {
    return this.instructorsService.findOne(instructorId);
  }

  @Mutation(() => InstructorType)
  async createInstructor(
    @Args('input') createInstructorInput: CreateInstructorInput,
  ): Promise<InstructorType> {
    return this.instructorsService.create(createInstructorInput);
  }

  @Mutation(() => InstructorType)
  async updateInstructor(
    @Args('instructorId', { type: () => ID }) instructorId: string,
    @Args('input') updateInstructorInput: CreateInstructorInput, // Should be partial but for simplicity using this for now
  ): Promise<InstructorType> {
    return this.instructorsService.update(instructorId, updateInstructorInput);
  }

  @Mutation(() => Boolean)
  async deleteInstructor(
    @Args('instructorId', { type: () => ID }) instructorId: string,
  ): Promise<boolean> {
    return this.instructorsService.delete(instructorId);
  }
}