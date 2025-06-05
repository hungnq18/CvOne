import { Controller, Get } from '@nestjs/common';
import { CvTemplateService } from './cv-template.service'; // Adjust the import path as necessary
import { CvTemplate } from './schemas/cv-template.schema'; // Adjust the import path as necessary
@Controller('cv-template')
export class CvTemplateController {
constructor(private readonly CvTemplateService: CvTemplateService) {}
/* THIS FUNCTION IS GET LISTTING TEMPLATE OF CV */
@Get()// cv-template
async getAllCvTemplates(): Promise<CvTemplate[]> {
    return this.CvTemplateService.findAllCvTemplates();
}

}