import { Test, TestingModule } from '@nestjs/testing';
<<<<<<< HEAD:src/modules/assessments/assessments.service.spec.ts
import { AssessmentsService } from './assessments.service';
<<<<<<< HEAD
import { beforeEach, describe, expect, it } from '@jest/globals';
=======
=======
import { getModelToken } from '@nestjs/mongoose';
import { InstructorsService } from './instructors.service';
>>>>>>> origin/Phirum:src/modules/instructors/instructors.service.spec.ts
>>>>>>> 3e412e0a3073d1fc57436b50decd4a7538f321d1

describe('AssessmentsService', () => {
  let service: AssessmentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
<<<<<<< HEAD:src/modules/assessments/assessments.service.spec.ts
      providers: [AssessmentsService],
=======
      providers: [
        InstructorsService,
        {
          provide: getModelToken('Instructor'),
          useValue: jest.fn(),
        },
      ],
>>>>>>> origin/Phirum:src/modules/instructors/instructors.service.spec.ts
    }).compile();

    service = module.get<AssessmentsService>(AssessmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
