import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CvTemplate } from '../cv-template/schemas/cv-template.schema';
import { CvService } from './cv.service';
import { Cv } from './schemas/cv.schema';

@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getAll(@Request() req) {
    return this.cvService.getAllCVs(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getById(@Param('id') id: string, @Request() req) {
    return this.cvService.getCVById(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() data, @Request() req) {
    return this.cvService.createCV(req.user.id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() data, @Request() req) {
    return this.cvService.updateCV(id, req.user.id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string, @Request() req) {
    return this.cvService.deleteCV(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/share')
  async shareCV(@Param('id') id: string, @Request() req): Promise<Cv> {
    return this.cvService.shareCV(id, req.user.id);
  }

  @Get('templates')
  async getAllTemplates(): Promise<CvTemplate[]> {
    return this.cvService.getAllTemplates();
  }

  @Get('templates/:id')
  async getTemplateById(@Param('id') id: string): Promise<CvTemplate> {
    return this.cvService.getTemplateById(id);
  }
} 