import * as crypto from "crypto";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { File } from "./entities/file.entity";
import {
  FileProcessingJob,
  JobStatus,
} from "./entities/file-processing-job.entity";
import { MinioService } from "./services/minio.service";
import { SearchFilesDto } from "./dto/search-files.dto";

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    @InjectRepository(FileProcessingJob)
    private readonly jobRepository: Repository<FileProcessingJob>,
    @InjectQueue("file-processing")
    private readonly fileProcessingQueue: Queue,
    private readonly minioService: MinioService
  ) {}

  private generateFileHash(buffer: Buffer): string {
    return crypto.createHash("sha256").update(buffer).digest("hex");
  }

  async uploadFile(file: Express.Multer.File): Promise<
    File & {
      isDuplicate?: boolean;
      attemptedFileName?: string;
    }
  > {
    const queryRunner =
      this.fileRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const fileHash = this.generateFileHash(file.buffer);

      const existingFile = await queryRunner.manager.findOne(File, {
        where: { fileHash },
      });

      if (existingFile) {
        this.logger.log(
          `File already exists with hash: ${fileHash}, returning existing file: ${existingFile.id}`
        );

        const existingJob = await queryRunner.manager.findOne(
          FileProcessingJob,
          {
            where: { fileId: existingFile.id },
            order: { createdAt: "DESC" },
          }
        );

        if (!existingJob || existingJob.status === JobStatus.FAILED) {
          const processingJob = queryRunner.manager.create(FileProcessingJob, {
            fileId: existingFile.id,
            status: JobStatus.PENDING,
          });

          await queryRunner.manager.save(processingJob);
          await queryRunner.commitTransaction();

          // Queue operations after successful transaction
          await this.fileProcessingQueue.add("extract-text", {
            fileId: existingFile.id,
          });

          this.logger.log(
            `Requeued processing for existing file: ${existingFile.id}`
          );
        } else {
          await queryRunner.commitTransaction();
        }

        return {
          ...existingFile,
          isDuplicate: true,
          attemptedFileName: file.originalname,
        };
      }

      // Upload to MinIO before database operations
      let minioPath: string;

      try {
        minioPath = await this.minioService.uploadFile(
          file.originalname,
          file.buffer,
          file.mimetype
        );
      } catch (minioError) {
        await queryRunner.rollbackTransaction();
        throw minioError;
      }

      const fileEntity = queryRunner.manager.create(File, {
        filename: file.filename || file.originalname,
        originalName: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        minioPath,
        fileHash,
      });

      const savedFile = await queryRunner.manager.save(fileEntity);
      const processingJob = queryRunner.manager.create(FileProcessingJob, {
        fileId: savedFile.id,
        status: JobStatus.PENDING,
      });

      await queryRunner.manager.save(processingJob);
      await queryRunner.commitTransaction();

      // Queue operations after successful transaction
      await this.fileProcessingQueue.add("extract-text", {
        fileId: savedFile.id,
      });

      this.logger.log(
        `File uploaded and queued for processing: ${savedFile.id}`
      );

      return { ...savedFile, isDuplicate: false };
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`, error.stack);
      await queryRunner.rollbackTransaction();

      // If MinIO upload succeeded but database operations failed, cleanup the uploaded file
      if (error.minioPath) {
        try {
          await this.minioService.deleteFile(error.minioPath);
        } catch (cleanupError) {
          this.logger.error(
            `Failed to cleanup MinIO file after transaction failure: ${cleanupError.message}`,
            cleanupError.stack
          );
        }
      }

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async searchFiles(searchDto: SearchFilesDto) {
    const { query, limit, offset } = searchDto;

    try {
      return await this.searchFilesByText(query, limit, offset);
    } catch (error) {
      this.logger.error(`Error searching files: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async searchFilesByText(
    query: string,
    limit: number,
    offset: number
  ) {
    const queryBuilder = this.fileRepository
      .createQueryBuilder("f")
      .select([
        "f.id",
        "f.filename",
        "f.originalName",
        "f.mimeType",
        "f.sizeBytes",
        "f.latestJobStatus",
        "f.latestJobErrorMessage",
        "f.createdAt",
        "f.updatedAt",
      ])
      .addSelect(
        "ts_headline('english', COALESCE(f.extracted_text, ''), plainto_tsquery('english', :query), 'MaxWords=50')",
        "snippet"
      )
      .where("f.search_vector @@ plainto_tsquery('english', :query)")
      .orderBy(
        "ts_rank(f.search_vector, plainto_tsquery('english', :query))",
        "DESC"
      )
      .setParameters({ query })
      .limit(limit)
      .offset(offset);

    const [files, total] = await Promise.all([
      queryBuilder.getRawAndEntities(),
      queryBuilder.getCount(),
    ]);

    return {
      files: files.entities.map((file, index) => ({
        ...file,
        snippet: files.raw[index]?.snippet || "",
      })),
      total,
      limit,
      offset,
    };
  }

  async findById(id: string): Promise<File> {
    const file = await this.fileRepository.findOne({ where: { id } });

    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    return file;
  }

  async getAllFiles(limit = 50, offset = 0) {
    const [files, total] = await this.fileRepository.findAndCount({
      select: [
        "id",
        "filename",
        "originalName",
        "mimeType",
        "sizeBytes",
        "createdAt",
        "latestJobStatus",
        "latestJobErrorMessage",
        "updatedAt",
      ],
      order: { createdAt: "DESC" },
      take: limit,
      skip: offset,
    });

    return { files, total, limit, offset };
  }

  async deleteFile(id: string): Promise<void> {
    const file = await this.findById(id);

    try {
      await this.minioService.deleteFile(file.minioPath);
      await this.fileRepository.remove(file);
      this.logger.log(`File deleted successfully: ${id}`);
    } catch (error) {
      this.logger.error(
        `Error deleting file ${id}: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  async downloadFile(id: string): Promise<Buffer> {
    const file = await this.findById(id);
    return await this.minioService.downloadFile(file.minioPath);
  }
}
