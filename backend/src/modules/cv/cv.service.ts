import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CvTemplate } from '../cv-template/schemas/cv-template.schema';
import { CreateCvDto } from './dto/create-cv.dto';
import { Cv } from './schemas/cv.schema';

@Injectable()
export class CvService {
  constructor(
    @InjectModel(Cv.name) private cvModel: Model<Cv>,
    @InjectModel(CvTemplate.name) private cvTemplateModel: Model<CvTemplate>,
  ) {}

  async getAllCVs(userId: string): Promise<Cv[]> {
    return this.cvModel.find({ userId }).exec();
  }

  async getCVById(id: string, userId: string): Promise<Cv> {
    const cv = await this.cvModel.findOne({ _id: id, userId }).exec();
    if (!cv) {
      throw new NotFoundException('CV not found');
    }
    return cv;
  }

  /**
   * Create a new CV
   * @param createCvDto - The CV data
   * @param userId - The ID of the user creating the CV
   */
  async createCV(createCvDto: CreateCvDto, userId: string) {
    // Check if template exists
    const template = await this.cvTemplateModel.findById(createCvDto.cvTemplateId);
    if (!template) {
      throw new NotFoundException('CV template not found');
    }

    const newCV = new this.cvModel({
      ...createCvDto,
      userId,
      isPublic: false,
      isSaved: false,
    });

    const savedCV = await newCV.save();
    return savedCV;
  }

  async updateCV(id: string, userId: string, data: Partial<Cv>): Promise<Cv> {
    const cv = await this.cvModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: data },
      { new: true }
    ).exec();
    if (!cv) {
      throw new NotFoundException('CV not found');
    }
    return cv;
  }

  async deleteCV(id: string, userId: string): Promise<void> {
    const result = await this.cvModel.deleteOne({ _id: id, userId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('CV not found');
    }
  }

  /**
   * Save a CV
   * @param cvId - The ID of the CV to save
   * @param userId - The ID of the user saving the CV
   */
  async saveCV(cvId: string, userId: string) {
    const cv = await this.cvModel.findById(cvId);
    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    // Check if user has permission to save this CV
    if (cv.userId.toString() !== userId) {
      throw new UnauthorizedException('You do not have permission to save this CV');
    }

    cv.isSaved = true;
    await cv.save();

    return { message: 'CV saved successfully' };
  }

  /**
   * Unsave a CV
   * @param cvId - The ID of the CV to unsave
   * @param userId - The ID of the user unsaving the CV
   */
  async unsaveCV(cvId: string, userId: string) {
    const cv = await this.cvModel.findById(cvId);
    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    // Check if user has permission to unsave this CV
    if (cv.userId.toString() !== userId) {
      throw new UnauthorizedException('You do not have permission to unsave this CV');
    }

    cv.isSaved = false;
    await cv.save();

    return { message: 'CV unsaved successfully' };
  }

  /**
   * Share a CV (make it public)
   * @param cvId - The ID of the CV to share
   * @param userId - The ID of the user sharing the CV
   */
  async shareCV(cvId: string, userId: string) {
    const cv = await this.cvModel.findById(cvId);
    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    // Check if user has permission to share this CV
    if (cv.userId.toString() !== userId) {
      throw new UnauthorizedException('You do not have permission to share this CV');
    }

    cv.isPublic = true;
    await cv.save();

    return { message: 'CV shared successfully' };
  }

  /**
   * Unshare a CV (make it private)
   * @param cvId - The ID of the CV to unshare
   * @param userId - The ID of the user unsharing the CV
   */
  async unshareCV(cvId: string, userId: string) {
    const cv = await this.cvModel.findById(cvId);
    if (!cv) {
      throw new NotFoundException('CV not found');
    }

    // Check if user has permission to unshare this CV
    if (cv.userId.toString() !== userId) {
      throw new UnauthorizedException('You do not have permission to unshare this CV');
    }

    cv.isPublic = false;
    await cv.save();

    return { message: 'CV unshared successfully' };
  }

  /**
   * Get all saved CVs for a user
   * @param userId - The ID of the user
   */
  async getSavedCVs(userId: string) {
    return this.cvModel.find({
      userId,
      isSaved: true
    }).exec();
  }

  async getAllTemplates(): Promise<CvTemplate[]> {
    return this.cvTemplateModel.find().exec();
  }

  async getTemplateById(id: string): Promise<CvTemplate> {
    const template = await this.cvTemplateModel.findById(id).exec();
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return template;
  }
}