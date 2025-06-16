import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CvTemplate } from '../cv-template/schemas/cv-template.schema';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';

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
   * Create a new CV
   * @param createCvDto - The CV data
   * @param req - Request object containing user information
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async createCV(@Body() createCvDto: CreateCvDto, @Request() req) {
    return this.cvService.createCV(createCvDto, req.user.id);
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
   * Save a CV
   * @param id - The ID of the CV to save
   * @param req - Request object containing user information
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/save')
  async saveCV(@Param('id') id: string, @Request() req) {
    return this.cvService.saveCV(id, req.user.id);
  }

  /**
   * Unsave a CV
   * @param id - The ID of the CV to unsave
   * @param req - Request object containing user information
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/unsave')
  async unsaveCV(@Param('id') id: string, @Request() req) {
    return this.cvService.unsaveCV(id, req.user.id);
  }

  /**
   * Share a CV
   * @param id - The ID of the CV to share
   * @param req - Request object containing user information
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/share')
  async shareCV(@Param('id') id: string, @Request() req) {
    return this.cvService.shareCV(id, req.user.id);
  }

  /**
   * Unshare a CV
   * @param id - The ID of the CV to unshare
   * @param req - Request object containing user information
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/unshare')
  async unshareCV(@Param('id') id: string, @Request() req) {
    return this.cvService.unshareCV(id, req.user.id);
  }

  /**
   * Get all saved CVs for the current user
   * @param req - Request object containing user information
   */
  @UseGuards(JwtAuthGuard)
  @Get('saved')
  async getSavedCVs(@Request() req) {
    return this.cvService.getSavedCVs(req.user.id);
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