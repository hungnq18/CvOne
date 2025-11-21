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
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";

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
  @Get()
  @UseGuards(JwtAuthGuard)
  getOrderByUser(@Request() req) {
    const userId = req.user.user._id;
    return this.ordersService.getOrderForUser(userId);
  }

  @Get("all")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  getAllOrders() {
    return this.ordersService.getAllOrders();
  }
}
