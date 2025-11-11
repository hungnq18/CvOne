import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { File as MulterFile } from "multer";
import * as pdf from "pdf-parse";
import { Roles } from "src/common/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { JobAnalysisService } from "../cv/services/job-analysis.service";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";

@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    const userId = req.user.user._id;
    return this.ordersService.createOrder(createOrderDto, userId);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  update(@Param("id") id: string, @Body() status: string) {
    return this.ordersService.updateOrderStatus(id, status);
  }
  @Patch(":orderCode/update")
  @UseGuards(JwtAuthGuard)
  updateByOrderCode(
    @Param("orderCode") orderCode: string,
    @Body() status: string
  ) {
    return this.ordersService.updateOrderStatusByOrderCode(orderCode, status);
  }
}
