import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PayosService } from "./payos.service";
import { PayosController } from "./payos.controller";

@Module({
  imports: [ConfigModule],
  controllers: [PayosController],
  providers: [PayosService],
  exports: [PayosService],
})
export class PayosModule {}
