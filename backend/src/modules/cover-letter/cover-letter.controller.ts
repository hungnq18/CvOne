import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import { CoverLetterService } from "./cover-letter.service";
import { CreateCoverLetterDto } from "./dto/create-cover-letter.dto";
import { UpdateCoverLetterDto } from "./dto/update-cover-letter.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("cover-letters")
export class CoverLetterController {
  constructor(private readonly coverLetterService: CoverLetterService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateCoverLetterDto, @Request() req) {
    const userId = req.user.user._id;
    return this.coverLetterService.create(dto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAllByUser(@Request() req) {
    const userId = req.user.user._id;
    return this.coverLetterService.findAll(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  findOne(@Param("id") id: string, @Request() req) {
    const userId = req.user.user._id;
    return this.coverLetterService.findOne(id, userId);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateCoverLetterDto) {
    return this.coverLetterService.update(id, dto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.coverLetterService.remove(id);
  }
}
