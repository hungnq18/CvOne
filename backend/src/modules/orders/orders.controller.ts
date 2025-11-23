import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
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
  update(@Param("id") id: string, @Body("status") status: string) {
    return this.ordersService.updateOrderStatus(id, status);
  }
  @Patch(":orderCode/update")
  @UseGuards(JwtAuthGuard)
  updateByOrderCode(
    @Param("orderCode") orderCode: string,
    @Body("status") status: string
  ) {
    return this.ordersService.updateOrderStatusByOrderCode(orderCode, status);
  }
  // API lấy order theo orderCode
  @Get("code/:orderCode")
  async getOrderByCode(@Param("orderCode") orderCode: string) {
    return this.ordersService.getOrderByOrderCode(orderCode);
  }
  // order history
  @Get("history")
  @UseGuards(JwtAuthGuard)
  async getOrderHistory(@Request() req) {
    const userId = req.user.user._id;
    return this.ordersService.getOrderHistory(userId);
  }
}
