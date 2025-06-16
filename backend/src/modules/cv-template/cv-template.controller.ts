import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { CvTemplateService } from './cv-template.service';

/**
 * Controller for handling CV template related requests
 * All endpoints in this controller are public (no authentication required)
 */
@Controller('cv-templates')
export class CvTemplateController {
  constructor(private readonly cvTemplateService: CvTemplateService) {}

  /**
   * Get all CV templates
   * @returns Array of CV templates
   * @public - No authentication required
   */
  @Public()
  @Get()
  async findAll() {
    return this.cvTemplateService.findAll();
  }

  /**
   * Get a specific CV template by ID
   * @param id - The ID of the CV template to retrieve
   * @returns CV template object
   * @public - No authentication required
   */
  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.cvTemplateService.findOne(id);
  }
}