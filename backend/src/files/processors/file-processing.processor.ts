import { Process, Processor } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { Job } from "bull";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { File } from "../entities/file.entity";
import {
  FileProcessingJob,
  JobStatus,
} from "../entities/file-processing-job.entity";
import { MinioService } from "../services/minio.service";
import { TextExtractionService } from "../services/text-extraction.service";

interface FileProcessingJobData {
  fileId: string;
}

@Processor("file-processing")
export class FileProcessingProcessor {
  private readonly logger = new Logger(FileProcessingProcessor.name);

  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    @InjectRepository(FileProcessingJob)
    private readonly jobRepository: Repository<FileProcessingJob>,
    private readonly minioService: MinioService,
    private readonly textExtractionService: TextExtractionService
  ) {}

  @Process("extract-text")
  async handleTextExtraction(job: Job<FileProcessingJobData>) {
    const { fileId } = job.data;
    this.logger.log(`Processing file: ${fileId}`);

    const processingJob = await this.jobRepository.findOne({
      where: { fileId },
      relations: ["file"],
    });

    if (!processingJob) {
      this.logger.error(`Processing job not found for file: ${fileId}`);
      return;
    }

    try {
      await this.fileRepository.update(fileId, {
        latestJobStatus: JobStatus.PROCESSING,
      });

      await this.jobRepository.update(processingJob.id, {
        status: JobStatus.PROCESSING,
      });

      const file = processingJob.file;
      const fileBuffer = await this.minioService.downloadFile(file.minioPath);

      const extractedText = await this.textExtractionService.extractText(
        fileBuffer,
        file.mimeType,
        file.originalName
      );

      await this.fileRepository.update(file.id, {
        latestJobStatus: JobStatus.COMPLETED,
        extractedText,
      });

      await this.jobRepository.update(processingJob.id, {
        status: JobStatus.COMPLETED,
      });

      this.logger.log(`Successfully processed file: ${fileId}`);
    } catch (error) {
      this.logger.error(
        `Error processing file ${fileId}: ${error.message}`,
        error.stack
      );

      await this.fileRepository.update(fileId, {
        latestJobStatus: JobStatus.FAILED,
        latestJobErrorMessage: error.message,
      });

      await this.jobRepository.update(processingJob.id, {
        status: JobStatus.FAILED,
        errorMessage: error.message,
      });
    }
  }
}
