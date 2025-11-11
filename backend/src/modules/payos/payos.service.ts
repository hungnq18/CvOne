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
    orderCode: number,
    amount: number,
    description: string
  ) {
    try {
      const bodyWithoutSig = {
        orderCode: orderCode,
        amount,
        description,
        cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel`,
        returnUrl: `${process.env.FRONTEND_URL}/payment/success`,
      };

      const body = {
        ...bodyWithoutSig,
        signature: this.generateSignature(bodyWithoutSig),
      };

      const res = await axios.post(`${this.baseUrl}`, body, {
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

  private generateSignature(data: Record<string, any>): string {
    const rawData = Object.keys(data)
      .sort() // sắp xếp theo key tên từ a-z
      .map((key) => `${key}=${data[key]}`)
      .join("&");

    return crypto
      .createHmac("sha256", this.checksumKey || "")
      .update(rawData)
      .digest("hex");
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

  async getPaymentDetail(orderCode: number) {
    try {
      const res = await axios.get(`${this.baseUrl}/${orderCode}`, {
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
}
