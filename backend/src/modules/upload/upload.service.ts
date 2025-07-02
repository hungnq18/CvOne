import { Injectable } from "@nestjs/common";
import { Express } from "express";
import * as fs from "fs";
import * as path from "path";

@Injectable()
export class UploadService {
  saveFile(file) {
    return {
      originalname: file.originalname,
      filename: file.filename,
      path: `/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}
