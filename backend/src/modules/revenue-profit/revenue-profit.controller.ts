import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Query,
    Request,
    UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateProfitDto } from './dto/create-profit.dto';
import { CreateRevenueDto } from './dto/create-revenue.dto';
import { FilterRevenueDto } from './dto/filter-revenue.dto';
import { UpdateRevenueDto } from './dto/update-revenue.dto';
import { RevenueProfitService } from './revenue-profit.service';
import { CostStatus } from './schemas/profit.schema';
import { RevenueType } from './schemas/revenue.schema';

@Controller('revenue-profit')
export class RevenueProfitController {
  constructor(
    private readonly revenueProfitService: RevenueProfitService,
  ) {}

  // Revenue endpoints
  @Post('revenue')
  @UseGuards(JwtAuthGuard)
  createRevenue(@Body() createRevenueDto: CreateRevenueDto, @Request() req) {
    const userId = req.user.user._id;
    return this.revenueProfitService.createRevenue(createRevenueDto, userId);
  }

  @Get('revenue')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getAllRevenues(@Query() filterDto: FilterRevenueDto) {
    return this.revenueProfitService.getAllRevenues(filterDto);
  }

  @Get('revenue/summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getRevenueSummary(@Query() filterDto: FilterRevenueDto) {
    return this.revenueProfitService.getRevenueSummary(filterDto);
  }

  @Get('revenue/type/:type')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getRevenuesByType(@Param('type') type: RevenueType) {
    return this.revenueProfitService.getRevenuesByType(type);
  }

  @Get('revenue/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getRevenueById(@Param('id') id: string) {
    return this.revenueProfitService.getRevenueById(id);
  }

  @Put('revenue/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateRevenue(
    @Param('id') id: string,
    @Body() updateRevenueDto: UpdateRevenueDto,
  ) {
    return this.revenueProfitService.updateRevenue(id, updateRevenueDto);
  }

  @Delete('revenue/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  deleteRevenue(@Param('id') id: string) {
    return this.revenueProfitService.deleteRevenue(id);
  }

  // Profit endpoints
  @Post('profit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  createProfit(@Body() createProfitDto: CreateProfitDto) {
    return this.revenueProfitService.createProfit(createProfitDto);
  }

  @Get('profit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getAllProfits(
    @Query('period') period?: string,
    @Query('periodType') periodType?: string,
  ) {
    return this.revenueProfitService.getAllProfits(period, periodType);
  }

  @Get('profit/summary')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getProfitSummary(
    @Query('period') period?: string,
    @Query('periodType') periodType?: string,
  ) {
    return this.revenueProfitService.getProfitSummary(period, periodType);
  }

  @Get('profit/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  getProfitById(@Param('id') id: string) {
    return this.revenueProfitService.getProfitById(id);
  }

  @Put('profit/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateProfit(
    @Param('id') id: string,
    @Body() updateData: Partial<CreateProfitDto>,
  ) {
    return this.revenueProfitService.updateProfit(id, updateData);
  }

  @Post('profit/:id/cost')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  addCostToProfit(
    @Param('id') id: string,
    @Body() cost: CreateProfitDto['costs'][0],
  ) {
    return this.revenueProfitService.addCostToProfit(id, cost);
  }

  @Put('profit/:id/cost/:costIndex')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateCostStatus(
    @Param('id') id: string,
    @Param('costIndex') costIndex: number,
    @Body('status') status: CostStatus,
  ) {
    return this.revenueProfitService.updateCostStatus(
      id,
      parseInt(costIndex.toString()),
      status,
    );
  }

  @Delete('profit/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  deleteProfit(@Param('id') id: string) {
    return this.revenueProfitService.deleteProfit(id);
  }
}

