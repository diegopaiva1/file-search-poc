import * as Minio from "minio";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MinioConfig } from "../../config/minio.config";

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private readonly minioClient: Minio.Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    const config = this.configService.get<MinioConfig>("minio");

    if (!config) {
      throw new Error(
        "MinIO configuration is missing. Please check your environment variables and configuration."
      );
    }

    this.bucketName = config.bucketName;

    this.minioClient = new Minio.Client({
      endPoint: config.endPoint,
      port: config.port,
      useSSL: config.useSSL,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
    });
  }

  async onModuleInit() {
    await this.ensureBucketExists();
  }

  private async ensureBucketExists(): Promise<void> {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);

      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName);
        this.logger.log(`Bucket '${this.bucketName}' created successfully`);
      } else {
        this.logger.log(`Bucket '${this.bucketName}' already exists`);
      }
    } catch (error) {
      this.logger.error(
        `Error ensuring bucket exists: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  async uploadFile(
    fileName: string,
    fileBuffer: Buffer,
    mimeType: string
  ): Promise<string> {
    try {
      const objectName = `${Date.now()}-${fileName}`;

      await this.minioClient.putObject(
        this.bucketName,
        objectName,
        fileBuffer,
        fileBuffer.length,
        { "Content-Type": mimeType }
      );

      this.logger.log(`File uploaded successfully: ${objectName}`);
      return objectName;
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`, error.stack);
      throw error;
    }
  }

  async downloadFile(objectName: string): Promise<Buffer> {
    try {
      const dataStream = await this.minioClient.getObject(
        this.bucketName,
        objectName
      );

      const chunks: Buffer[] = [];

      return new Promise((resolve, reject) => {
        dataStream.on("data", (chunk) => chunks.push(chunk));
        dataStream.on("error", reject);
        dataStream.on("end", () => resolve(Buffer.concat(chunks)));
      });
    } catch (error) {
      this.logger.error(
        `Error downloading file: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  async deleteFile(objectName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, objectName);
      this.logger.log(`File deleted successfully: ${objectName}`);
    } catch (error) {
      this.logger.error(`Error deleting file: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getFileUrl(objectName: string, expiry: number = 3600): Promise<string> {
    try {
      return await this.minioClient.presignedGetObject(
        this.bucketName,
        objectName,
        expiry
      );
    } catch (error) {
      this.logger.error(
        `Error generating file URL: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }
}
