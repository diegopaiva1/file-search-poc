import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { File } from './entities/file.entity';
import { FileProcessingJob } from './entities/file-processing-job.entity';
import { MinioService } from './services/minio.service';
import { TextExtractionService } from './services/text-extraction.service';
import { FileProcessingProcessor } from './processors/file-processing.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([File, FileProcessingJob]),
    BullModule.registerQueue({
      name: 'file-processing',
    }),
  ],
  controllers: [FilesController],
  providers: [
    FilesService,
    MinioService,
    TextExtractionService,
    FileProcessingProcessor,
  ],
})
export class FilesModule {}