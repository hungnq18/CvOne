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

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() body: CreateNotificationDto & { recipient?: string },
    @Request() req,
  ) {
    const { title, message, type, link, jobId, recipient } = body;
    const recipientId = recipient || req.user.user._id;
    return this.notificationsService.createNotification(
      {
        title,
        message,
        type,
        link,
        jobId,
      },
      recipientId,
    );
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
  async markAsRead(@Param("id") id: string) {
    return this.notificationsService.markAsRead(id);
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
