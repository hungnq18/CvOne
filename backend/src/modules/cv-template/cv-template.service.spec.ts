import { Test, TestingModule } from '@nestjs/testing';
import { CvTemplateService } from './cv-template.service';

describe('CvTemplateService', () => {
  let service: CvTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CvTemplateService],
    }).compile();

    service = module.get<CvTemplateService>(CvTemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
