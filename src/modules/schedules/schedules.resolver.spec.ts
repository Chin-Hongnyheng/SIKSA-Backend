import { Test, TestingModule } from '@nestjs/testing';
import { SchedulesResolver } from './schedules.resolver';

describe('SchedulesResolver', () => {
  let resolver: SchedulesResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchedulesResolver],
    }).compile();

    resolver = module.get<SchedulesResolver>(SchedulesResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
