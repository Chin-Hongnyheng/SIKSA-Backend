import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { UserType } from './dto/users.type';
import { CreateLoginInput } from './dto/login.input';

@Resolver(() => UserType)
export class UserResolver {
  constructor(private readonly usersService: UsersService) { }

  @Query(() => [UserType])
  users() {
    return this.usersService.findAll();
  }

  @Query(() => UserType, { nullable: true })
  user(@Args('id', { type: () => ID }) id: string) {
    return this.usersService.findOne(id);
  }

  @Mutation(() => UserType)
  createUser(@Args('input') input: CreateLoginInput) {
    return this.usersService.create(input);
  }

  @Mutation(() => UserType)
  updateUser(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: CreateLoginInput,
  ) {
    return this.usersService.update(id, input);
  }

  @Mutation(() => Boolean)
  deleteUser(@Args('id', { type: () => ID }) id: string) {
    return this.usersService.delete(id);
  }
}