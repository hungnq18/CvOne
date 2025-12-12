import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RevenueProfitController } from './revenue-profit.controller';
import { RevenueProfitService } from './revenue-profit.service';
import { Profit, ProfitSchema } from './schemas/profit.schema';
import { Revenue, RevenueSchema } from './schemas/revenue.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Revenue.name, schema: RevenueSchema },
      { name: Profit.name, schema: ProfitSchema },
    ]),
  ],
  controllers: [RevenueProfitController],
  providers: [RevenueProfitService],
  exports: [RevenueProfitService],
})
export class RevenueProfitModule {}

