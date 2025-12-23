// notifications.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  Request,
  UseGuards,
} from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { Types } from "mongoose";
import { CreateNotificationDto } from "./dto/create-notification.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { User } from "src/common/decorators/user.decorator";
import { NotificationsGateway } from "./notifications.gateway";

@Controller("notifications")
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationGateway: NotificationsGateway
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() body: CreateNotificationDto & { recipient?: string },
    @Request() req
  ) {
    const { title, message, type, link, jobId, recipient } = body;
    // Ưu tiên recipient được truyền từ client, nếu không có thì dùng user hiện tại
    let recipientId = recipient || req.user.user._id;

    // Nếu recipientId không phải ObjectId hợp lệ thì fallback về user hiện tại
    if (!Types.ObjectId.isValid(recipientId)) {
      recipientId = req.user.user._id;
    }
    const notification = await this.notificationsService.createNotification(
      {
        title,
        message,
        type,
        link,
        jobId,
      },
      recipientId
    );
    this.notificationGateway.emitNewNotification(
      notification.recipient.toString(),
      notification
    );
    return notification;
  }

  // Lấy danh sách thông báo của 1 người dùng
  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserNotifications(@Request() req) {
    const userId = req.user.user._id;

    return this.notificationsService.getNotificationsByUser(userId);
  }

  // Đánh dấu 1 thông báo là đã đọc
  @UseGuards(JwtAuthGuard)
  @Patch("read/:id")
  async markAsRead(@Param("id") id: string, @User("_id") userId: string) {
    return this.notificationsService.markAsRead(id, userId);
  }

  // Đánh dấu tất cả là đã đọc
  @UseGuards(JwtAuthGuard)
  @Patch("read-all")
  async markAllAsRead(@Request() req) {
    const userId = req.user.user._id;

    return this.notificationsService.markAllAsRead(userId);
  }

  // Xoá 1 thông báo
  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  async delete(@Param("id") id: string) {
    await this.notificationsService.deleteNotification(id);
    return { message: "Deleted successfully" };
  }
}
