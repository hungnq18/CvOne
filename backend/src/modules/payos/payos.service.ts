import { Injectable, HttpException } from "@nestjs/common";
import axios from "axios";
import * as crypto from "crypto";

@Injectable()
export class PayosService {
  private readonly baseUrl =
    process.env.PAYOS_BASE_URL || "https://api.payos.vn/v1";
  private readonly clientId = process.env.PAYOS_CLIENT_ID;
  private readonly apiKey = process.env.PAYOS_API_KEY;
  private readonly checksumKey = process.env.PAYOS_CHECKSUM_KEY;

  /**
   * Tạo link thanh toán qua PayOS
   */
  async createPaymentLink(
    orderId: string,
    amount: number,
    description: string
  ) {
    try {
      const body = {
        orderCode: orderId,
        amount,
        description,
        cancelUrl: `${process.env.APP_URL}/payment/cancel`,
        returnUrl: `${process.env.APP_URL}/payment/success`,
      };

      const res = await axios.post(`${this.baseUrl}/payment-requests`, body, {
        headers: {
          "x-client-id": this.clientId,
          "x-api-key": this.apiKey,
        },
      });

      return res.data;
    } catch (error) {
      throw new HttpException(error.response?.data || error.message, 500);
    }
  }

  /**
   * Xác minh chữ ký webhook từ PayOS
   */
  verifyWebhookSignature(data: any, signature: string): boolean {
    const computed = crypto
      .createHmac("sha256", this.checksumKey || "")
      .update(JSON.stringify(data))
      .digest("hex");
    return computed === signature;
  }
}
