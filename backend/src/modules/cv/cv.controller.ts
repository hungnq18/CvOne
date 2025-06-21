import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { User } from '../../common/decorators/user.decorator';
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
   * @param userId - The ID of the authenticated user
   * @returns Array of user's CVs
   * @requires Authentication
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  getAll(@User('_id') userId: string) {
    return this.cvService.getAllCVs(userId);
  }

  /**
   * Get a specific CV by ID
   * @param id - The ID of the CV to retrieve
   * @param userId - The ID of the authenticated user
   * @returns CV object if found and user has access
   * @requires Authentication
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getById(@Param('id') id: string, @User('_id') userId: string) {
    return this.cvService.getCVById(id, userId);
  }

  /**
   * Create a new CV
   * @param createCvDto - The CV data
   * @param userId - The ID of the authenticated user
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async createCV(@Body() createCvDto: CreateCvDto, @User('_id') userId: string) {
    return this.cvService.createCV(createCvDto, userId);
  }

  /**
   * Update an existing CV
   * @param id - The ID of the CV to update
   * @param data - Updated CV data
   * @param userId - The ID of the authenticated user
   * @returns Updated CV object
   * @requires Authentication
   */
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() data, @User('_id') userId: string) {
    return this.cvService.updateCV(id, userId, data);
  }

  /**
   * Delete a CV
   * @param id - The ID of the CV to delete
   * @param userId - The ID of the authenticated user
   * @returns Deletion confirmation
   * @requires Authentication
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string, @User('_id') userId: string) {
    return this.cvService.deleteCV(id, userId);
  }

  /**
   * Save a CV
   * @param id - The ID of the CV to save
   * @param userId - The ID of the authenticated user
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/save')
  async saveCV(@Param('id') id: string, @User('_id') userId: string) {
    return this.cvService.saveCV(id, userId);
  }

  /**
   * Unsave a CV
   * @param id - The ID of the CV to unsave
   * @param userId - The ID of the authenticated user
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/unsave')
  async unsaveCV(@Param('id') id: string, @User('_id') userId: string) {
    return this.cvService.unsaveCV(id, userId);
  }

  /**
   * Share a CV
   * @param id - The ID of the CV to share
   * @param userId - The ID of the authenticated user
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/share')
  async shareCV(@Param('id') id: string, @User('_id') userId: string) {
    return this.cvService.shareCV(id, userId);
  }

  /**
   * Unshare a CV
   * @param id - The ID of the CV to unshare
   * @param userId - The ID of the authenticated user
   */
  @UseGuards(JwtAuthGuard)
  @Post(':id/unshare')
  async unshareCV(@Param('id') id: string, @User('_id') userId: string) {
    return this.cvService.unshareCV(id, userId);
  }

  /**
   * Get all saved CVs for the current user
   * @param userId - The ID of the authenticated user
   */
  @UseGuards(JwtAuthGuard)
  @Get('saved')
  async getSavedCVs(@User('_id') userId: string) {
    return this.cvService.getSavedCVs(userId);
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