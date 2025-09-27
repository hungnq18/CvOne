import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Cv } from "../schemas/cv.schema";

@Injectable()
export class CvCacheService {
  private readonly logger = new Logger(CvCacheService.name);
  private readonly cache = new Map<string, any>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(@InjectModel(Cv.name) private cvModel: Model<Cv>) {}

  /**
   * Get CVs with caching
   */
  async getCachedCVs(userId: string, isSaved?: boolean): Promise<Cv[]> {
    const cacheKey = `cvs_${userId}_${isSaved || "all"}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      this.logger.debug(`Cache hit for ${cacheKey}`);
      return cached.data;
    }

    const query: any = { userId };
    if (isSaved !== undefined) {
      query.isSaved = isSaved;
    }

    const cvs = await this.cvModel
      .find(query)
      .select("-content") // Exclude large content field for list view
      .sort({ updatedAt: -1 })
      .exec();

    this.cache.set(cacheKey, {
      data: cvs,
      timestamp: Date.now(),
    });

    return cvs;
  }

  /**
   * Get single CV with caching
   */
  async getCachedCV(id: string, userId: string): Promise<Cv | null> {
    const cacheKey = `cv_${id}_${userId}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      this.logger.debug(`Cache hit for ${cacheKey}`);
      return cached.data;
    }

    const cv = await this.cvModel.findOne({ _id: id, userId }).exec();

    if (cv) {
      this.cache.set(cacheKey, {
        data: cv,
        timestamp: Date.now(),
      });
    }

    return cv;
  }

  /**
   * Invalidate cache for user
   */
  invalidateUserCache(userId: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter(
      (key) => key.includes(`_${userId}`) || key.includes(`cvs_${userId}`)
    );

    keysToDelete.forEach((key) => this.cache.delete(key));
    this.logger.debug(
      `Invalidated ${keysToDelete.length} cache entries for user ${userId}`
    );
  }

  /**
   * Invalidate specific CV cache
   */
  invalidateCVCache(id: string, userId: string): void {
    const cacheKey = `cv_${id}_${userId}`;
    this.cache.delete(cacheKey);
    this.logger.debug(`Invalidated cache for CV ${id}`);
  }

  /**
   * Clear all cache
   */
  clearAllCache(): void {
    this.cache.clear();
    this.logger.debug("Cleared all cache");
  }
}
