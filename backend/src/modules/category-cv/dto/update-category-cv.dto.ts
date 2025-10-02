import { PartialType } from "@nestjs/mapped-types";
import { CreateCategoryCvDto } from "./create-category-cv.dto";

export class UpdateCategoryCvDto extends PartialType(CreateCategoryCvDto) {}
