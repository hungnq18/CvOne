import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateProfitDto } from './dto/create-profit.dto';
import { CreateRevenueDto } from './dto/create-revenue.dto';
import { FilterRevenueDto } from './dto/filter-revenue.dto';
import { UpdateRevenueDto } from './dto/update-revenue.dto';
import { CostStatus, CostType, Profit, ProfitDocument } from './schemas/profit.schema';
import { Revenue, RevenueDocument, RevenueStatus, RevenueType } from './schemas/revenue.schema';

@Injectable()
export class RevenueProfitService {
  constructor(
    @InjectModel(Revenue.name) private revenueModel: Model<RevenueDocument>,
    @InjectModel(Profit.name) private profitModel: Model<ProfitDocument>,
  ) {}

  // Revenue methods
  async createRevenue(createRevenueDto: CreateRevenueDto, userId: string) {
    const revenue = await this.revenueModel.create({
      ...createRevenueDto,
      userId: new Types.ObjectId(userId),
      orderId: createRevenueDto.orderId
        ? new Types.ObjectId(createRevenueDto.orderId)
        : undefined,
      revenueDate: new Date(createRevenueDto.revenueDate),
      status: createRevenueDto.status || RevenueStatus.PENDING,
    });

    return revenue;
  }

  async getAllRevenues(filterDto?: FilterRevenueDto) {
    const filter: any = {};

    if (filterDto?.revenueType) {
      filter.revenueType = filterDto.revenueType;
    }

    if (filterDto?.status) {
      filter.status = filterDto.status;
    }

    if (filterDto?.userId) {
      filter.userId = new Types.ObjectId(filterDto.userId);
    }

    if (filterDto?.startDate || filterDto?.endDate) {
      filter.revenueDate = {};
      if (filterDto.startDate) {
        filter.revenueDate.$gte = new Date(filterDto.startDate);
      }
      if (filterDto.endDate) {
        filter.revenueDate.$lte = new Date(filterDto.endDate);
      }
    }

    return this.revenueModel
      .find(filter)
      .populate('userId', 'email firstName lastName')
      .populate('orderId')
      .sort({ revenueDate: -1 })
      .exec();
  }

  async getRevenueById(id: string) {
    const revenue = await this.revenueModel
      .findById(id)
      .populate('userId', 'email firstName lastName')
      .populate('orderId')
      .exec();

    if (!revenue) {
      throw new NotFoundException('Revenue not found');
    }

    return revenue;
  }

  async getRevenuesByType(revenueType: RevenueType) {
    return this.revenueModel
      .find({ revenueType, status: RevenueStatus.COMPLETED })
      .populate('userId', 'email firstName lastName')
      .populate('orderId')
      .sort({ revenueDate: -1 })
      .exec();
  }

  async updateRevenue(id: string, updateRevenueDto: UpdateRevenueDto) {
    const updateData: any = { ...updateRevenueDto };

    if (updateRevenueDto.revenueDate) {
      updateData.revenueDate = new Date(updateRevenueDto.revenueDate);
    }

    const revenue = await this.revenueModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    );

    if (!revenue) {
      throw new NotFoundException('Revenue not found');
    }

    return revenue;
  }

  async deleteRevenue(id: string) {
    const revenue = await this.revenueModel.findByIdAndDelete(id);

    if (!revenue) {
      throw new NotFoundException('Revenue not found');
    }

    return { message: 'Revenue deleted successfully' };
  }

  async getRevenueSummary(filterDto?: FilterRevenueDto) {
    const filter: any = { status: RevenueStatus.COMPLETED };

    if (filterDto?.revenueType) {
      filter.revenueType = filterDto.revenueType;
    }

    if (filterDto?.startDate || filterDto?.endDate) {
      filter.revenueDate = {};
      if (filterDto.startDate) {
        filter.revenueDate.$gte = new Date(filterDto.startDate);
      }
      if (filterDto.endDate) {
        filter.revenueDate.$lte = new Date(filterDto.endDate);
      }
    }

    const revenues = await this.revenueModel.find(filter).exec();

    const summary = {
      totalRevenue: revenues.reduce((sum, r) => sum + r.amount, 0),
      count: revenues.length,
      byType: {} as Record<RevenueType, { count: number; total: number }>,
    };

    revenues.forEach((revenue) => {
      if (!summary.byType[revenue.revenueType]) {
        summary.byType[revenue.revenueType] = { count: 0, total: 0 };
      }
      summary.byType[revenue.revenueType].count++;
      summary.byType[revenue.revenueType].total += revenue.amount;
    });

    return summary;
  }

  // Profit methods
  async createProfit(createProfitDto: CreateProfitDto) {
    const costs = createProfitDto.costs.map((cost) => ({
      ...cost,
      costDate: new Date(cost.costDate),
      status: cost.status || CostStatus.PENDING,
    }));

    const profit = await this.profitModel.create({
      ...createProfitDto,
      revenueId: new Types.ObjectId(createProfitDto.revenueId),
      costs,
    });

    return profit;
  }

  async getAllProfits(period?: string, periodType?: string) {
    const filter: any = {};

    if (period) {
      filter.period = period;
    }

    if (periodType) {
      filter.periodType = periodType;
    }

    return this.profitModel
      .find(filter)
      .populate('revenueId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getProfitById(id: string) {
    const profit = await this.profitModel
      .findById(id)
      .populate('revenueId')
      .exec();

    if (!profit) {
      throw new NotFoundException('Profit not found');
    }

    return profit;
  }

  async updateProfit(id: string, updateData: Partial<CreateProfitDto>) {
    const update: any = { ...updateData };

    if (updateData.revenueId) {
      update.revenueId = new Types.ObjectId(updateData.revenueId);
    }

    if (updateData.costs) {
      update.costs = updateData.costs.map((cost) => ({
        ...cost,
        costDate: new Date(cost.costDate),
        status: cost.status || CostStatus.PENDING,
      }));
    }

    const profit = await this.profitModel.findByIdAndUpdate(id, update, {
      new: true,
    });

    if (!profit) {
      throw new NotFoundException('Profit not found');
    }

    return profit;
  }

  async addCostToProfit(profitId: string, cost: CreateProfitDto['costs'][0]) {
    const profit = await this.profitModel.findById(profitId);

    if (!profit) {
      throw new NotFoundException('Profit not found');
    }

    profit.costs.push({
      ...cost,
      costDate: new Date(cost.costDate),
      status: cost.status || CostStatus.PENDING,
    });

    await profit.save();

    return profit;
  }

  async updateCostStatus(
    profitId: string,
    costIndex: number,
    status: CostStatus,
  ) {
    const profit = await this.profitModel.findById(profitId);

    if (!profit) {
      throw new NotFoundException('Profit not found');
    }

    if (costIndex < 0 || costIndex >= profit.costs.length) {
      throw new BadRequestException('Invalid cost index');
    }

    profit.costs[costIndex].status = status;
    await profit.save();

    return profit;
  }

  async getProfitSummary(period?: string, periodType?: string) {
    const filter: any = {};

    if (period) {
      filter.period = period;
    }

    if (periodType) {
      filter.periodType = periodType;
    }

    const profits = await this.profitModel.find(filter).exec();

    const summary = {
      totalRevenue: profits.reduce((sum, p) => sum + p.totalRevenue, 0),
      totalCosts: profits.reduce((sum, p) => sum + p.totalCosts, 0),
      totalProfit: profits.reduce((sum, p) => sum + p.profit, 0),
      averageProfitMargin:
        profits.length > 0
          ? profits.reduce((sum, p) => sum + p.profitMargin, 0) /
            profits.length
          : 0,
      byCostType: {} as Record<
        CostType,
        { count: number; total: number }
      >,
    };

    profits.forEach((profit) => {
      profit.costs.forEach((cost) => {
        if (cost.status === CostStatus.PAID) {
          if (!summary.byCostType[cost.costType]) {
            summary.byCostType[cost.costType] = { count: 0, total: 0 };
          }
          summary.byCostType[cost.costType].count++;
          summary.byCostType[cost.costType].total += cost.amount;
        }
      });
    });

    return summary;
  }

  async deleteProfit(id: string) {
    const profit = await this.profitModel.findByIdAndDelete(id);

    if (!profit) {
      throw new NotFoundException('Profit not found');
    }

    return { message: 'Profit deleted successfully' };
  }
}

