import { Test, TestingModule } from '@nestjs/testing';
import { CvTemplateController } from './cv-template.controller';

describe('CvTemplateController', () => {
  let controller: CvTemplateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CvTemplateController],
    }).compile();

    controller = module.get<CvTemplateController>(CvTemplateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
