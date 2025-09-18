import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
  ParseUUIDPipe,
  StreamableFile,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { FilesService } from "./files.service";
import { SearchFilesDto } from "./dto/search-files.dto";

@Controller("files")
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const result = await this.filesService.uploadFile(file);
    return result;
  }

  @Get("search")
  async searchFiles(@Query() searchDto: SearchFilesDto) {
    return await this.filesService.searchFiles(searchDto);
  }

  @Get()
  async getAllFiles(
    @Query("limit") limit?: number,
    @Query("offset") offset?: number
  ) {
    return await this.filesService.getAllFiles(limit, offset);
  }

  @Get(":id")
  async getFile(@Param("id", ParseUUIDPipe) id: string) {
    return await this.filesService.findById(id);
  }

  @Get(":id/download")
  async getFileBuffer(
    @Param("id", ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const file = await this.filesService.findById(id);
    const buffer = await this.filesService.downloadFile(id);

    res.set({
      "Content-Type": file.mimeType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(file.originalName)}"`,
      "Content-Length": buffer.length,
    });

    return new StreamableFile(buffer);
  }

  @Delete(":id")
  async deleteFile(@Param("id", ParseUUIDPipe) id: string) {
    await this.filesService.deleteFile(id);
    return { message: "File deleted successfully" };
  }
}
