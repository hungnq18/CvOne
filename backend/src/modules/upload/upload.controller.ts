import {
    BadRequestException,
    Controller,
    Get,
    NotFoundException,
    Param,
    Post,
    Res,
    UploadedFile,
    UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { existsSync } from "fs";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { UploadService } from "./upload.service";

@Controller("upload")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: "./uploads",
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const baseName = file.mimetype.startsWith("image/")
            ? "image"
            : "file"; // 👈
          cb(null, `${baseName}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/jpg",
          "application/pdf", // 👈 hỗ trợ PDF
        ];

        if (!allowedTypes.includes(file.mimetype)) {
          return cb(
            new BadRequestException("Only image and PDF files are allowed!"),
            false
          );
        }
        cb(null, true);
      },

      limits: { fileSize: 10 * 1024 * 1024 }, // giới hạn 10MB để consistent với CV upload
    })
  )
  uploadFile(@UploadedFile() file) {
    if (!file) {
      throw new BadRequestException("No file uploaded or invalid file type.");
    }
    return this.uploadService.saveFile(file);
  }

  @Get(":filename")
  getFile(@Param("filename") filename: string, @Res() res: Response) {
    const filePath = join(__dirname, "..", "uploads", filename);

    if (!existsSync(filePath)) {
      throw new NotFoundException("File not found");
    }

    return res.sendFile(filePath);
  }
}
