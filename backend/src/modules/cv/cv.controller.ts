import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CvTemplate } from '../cv/schemas/cv-template.schema';
import { CvService } from './cv.service';
import { Cv } from './schemas/cv.schema';

/**
 * Controller for handling CV (Curriculum Vitae) related requests
 * Most endpoints require authentication using JWT
 * Template endpoints are public (no authentication required)
 */
@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  /**
   * Get all CVs for the authenticated user
   * @param req - Request object containing user information
   * @returns Array of user's CVs
   * @requires Authentication
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  getAll(@Request() req) {
    return this.cvService.getAllCVs(req.user.id);
  }

  /**
   * Get a specific CV by ID
   * @param id - The ID of the CV to retrieve
   * @param req - Request object containing user information
   * @returns CV object if found and user has access
   * @requires Authentication
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getById(@Param('id') id: string, @Request() req) {
    return this.cvService.getCVById(id, req.user.id);
  }

  /**
   * Create a new CV for the authenticated user
   * @param data - CV data to create
   * @param req - Request object containing user information
   * @returns Created CV object
   * @requires Authentication
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() data, @Request() req) {
    return this.cvService.createCV(req.user.id, data);
  }

  /**
   * Update an existing CV
   * @param id - The ID of the CV to update
   * @param data - Updated CV data
   * @param req - Request object containing user information
   * @returns Updated CV object
   * @requires Authentication
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() data, @Request() req) {
    return this.cvService.updateCV(id, req.user.id, data);
  }

  /**
   * Delete a CV
   * @param id - The ID of the CV to delete
   * @param req - Request object containing user information
   * @returns Deletion confirmation
   * @requires Authentication
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string, @Request() req) {
    return this.cvService.deleteCV(id, req.user.id);
  }

  /**
   * Share a CV (make it public)
   * @param id - The ID of the CV to share
   * @param req - Request object containing user information
   * @returns Updated CV object with sharing status
   * @requires Authentication
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/share')
  async shareCV(@Param('id') id: string, @Request() req): Promise<Cv> {
    return this.cvService.shareCV(id, req.user.id);
  }

  /**
   * Get all available CV templates
   * @returns Array of CV templates
   * @public - No authentication required
   */
  @Get('templates')
  async getAllTemplates(): Promise<CvTemplate[]> {
    return this.cvService.getAllTemplates();
  }

  /**
   * Get a specific CV template by ID
   * @param id - The ID of the template to retrieve
   * @returns Template object
   * @public - No authentication required
   */
  @Get('templates/:id')
  async getTemplateById(@Param('id') id: string): Promise<CvTemplate> {
    return this.cvService.getTemplateById(id);
  }
} 