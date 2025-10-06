import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CategoryCvService } from "./category-cv.service";
import { CreateCategoryCvDto } from "./dto/create-category-cv.dto";
import { UpdateCategoryCvDto } from "./dto/update-category-cv.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("category-cv")
export class CategoryCvController {
  constructor(private readonly categoryCvService: CategoryCvService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateCategoryCvDto) {
    return this.categoryCvService.create(dto);
  }

  @Get()
  findAll() {
    return this.categoryCvService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.categoryCvService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateCategoryCvDto) {
    return this.categoryCvService.update(id, dto);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.categoryCvService.remove(id);
  }
}
