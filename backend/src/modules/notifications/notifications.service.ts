// notifications/notifications.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {
  Notification,
  NotificationDocument,
} from "./schemas/notification.schema";
import { Model, Types } from "mongoose";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { NotificationsGateway } from "./notifications.gateway";

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>
  ) {}

  async createNotification(
    dto: CreateNotificationDto,
    userId: string
  ): Promise<NotificationDocument> {
    const created = new this.notificationModel({
      ...dto,
      recipient: new Types.ObjectId(userId),
      isRead: false,
      ...(dto.jobId ? { jobId: new Types.ObjectId(dto.jobId) } : {}),
    });

    const saved = await created.save();

    return saved;
  }

  async getNotificationsByUser(
    userId: string
  ): Promise<NotificationDocument[]> {
    return this.notificationModel
      .find({ recipient: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async markAsRead(
    notificationId: string,
    userId: string
  ): Promise<NotificationDocument> {
    // Cập nhật chỉ notification thuộc userId
    const updated = await this.notificationModel.findOneAndUpdate(
      { _id: notificationId, userId }, // filter theo cả notificationId và userId
      { isRead: true },
      { new: true } // trả về document sau khi update
    );

    if (!updated)
      throw new NotFoundException(
        "Notification not found or not belong to user"
      );

    return updated;
  }

  async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {
    const result = await this.notificationModel.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } }
    );
    return { modifiedCount: result.modifiedCount };
  }

  async deleteNotification(id: string): Promise<void> {
    await this.notificationModel.findByIdAndDelete(id);
  }
}
