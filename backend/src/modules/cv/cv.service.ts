 import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CvTemplate } from './schemas/cv-template.schema';
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

  async createCV(userId: string, data: Partial<Cv>): Promise<Cv> {
    const newCv = new this.cvModel({
      ...data,
      userId,
    });
    return newCv.save();
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

  async shareCV(id: string, userId: string): Promise<Cv> {
    const cv = await this.cvModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: { isPublic: true } },
      { new: true }
    ).exec();
    if (!cv) {
      throw new NotFoundException('CV not found');
    }
    return cv;
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