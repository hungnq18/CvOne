import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Cron, CronExpression } from "@nestjs/schedule";
import { NotificationsService } from "../notifications/notifications.service";
import { CreateNotificationDto } from "../notifications/dto/create-notification.dto";

import { Order, OrderDocument } from "./schemas/order.schema";
import { PayosService } from "../payos/payos.service";
@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private readonly payosService: PayosService
  ) {}
}
