import { Controller, Get, Query } from "@nestjs/common";
import { FilesService } from "./files.service";

@Controller("files")
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get("content")
  async getFileContent(@Query("url") url: string) {
    if (!url) {
      return { error: "Missing url query param" };
    }
    return this.filesService.extractContent(url);
  }
}
