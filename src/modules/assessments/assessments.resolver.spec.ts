import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentsResolver } from './assessments.resolver';
import { beforeEach, describe, expect, it } from '@jest/globals';

describe('AssessmentsResolver', () => {
  let resolver: AssessmentsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssessmentsResolver],
    }).compile();

    resolver = module.get<AssessmentsResolver>(AssessmentsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
