import { Injectable } from "@nestjs/common";
import axios from "axios";
import * as mammoth from "mammoth";
import * as pdf from "pdf-parse";

@Injectable()
export class FilesService {
  async extractContent(url: string): Promise<any> {
    // tải file từ Cloudinary
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);

    // xác định loại file từ url
    if (url.endsWith(".docx")) {
      const { value } = await mammoth.extractRawText({ buffer });
      return { type: "docx", content: value };
    }

    if (url.endsWith(".pdf")) {
      const data = await pdf(buffer);
      return { type: "pdf", content: data.text };
    }

    if (url.endsWith(".txt")) {
      return { type: "txt", content: buffer.toString("utf-8") };
    }

    // fallback cho loại file khác
    return { type: "unknown", content: "File type not supported yet." };
  }
}
