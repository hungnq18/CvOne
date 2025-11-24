import { Controller, Post, Body, Headers, Get, Param } from "@nestjs/common";
import { PayosService } from "./payos.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";

@Controller("payos")
export class PayosController {
  constructor(private readonly payosService: PayosService) {}

  /**
   * Tạo link thanh toán mới
   */
  @Post("create")
  async createPayment(@Body() body: CreatePaymentDto) {
    const { orderId, amount, description } = body;
    return this.payosService.createPaymentLink(orderId, amount, description);
  }

  /**
   * Nhận callback khi người dùng thanh toán xong
   */
  @Post("callback")
  async handleCallback(
    @Body() body: any,
    @Headers("x-signature") signature: string
  ) {
    const isValid = this.payosService.verifyWebhookSignature(body, signature);
    if (!isValid) {
      return { status: "failed", message: "Invalid signature" };
    }

    // ✅ Tại đây bạn xử lý đơn hàng sau thanh toán thành công
    console.log("✅ Payment success:", body);

    return { status: "ok" };
  }

  @Get(":orderCode")
  async getPaymentDetail(@Param("orderCode") orderCode: number) {
    return this.payosService.getPaymentDetail(orderCode);
  }

  @Post(":orderCode/cancel")
  async cancelPayment(
    @Param("orderCode") orderCode: number,
    @Body("cancellationReason") cancellationReason: string
  ) {
    return this.payosService.cancelLinkPayment(orderCode, cancellationReason);
  }
}
