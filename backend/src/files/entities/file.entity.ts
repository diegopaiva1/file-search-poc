import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { FileProcessingJob, JobStatus } from "./file-processing-job.entity";

@Entity("files")
export class File {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 255 })
  filename: string;

  @Column({ name: "original_name", length: 255 })
  originalName: string;

  @Column({ name: "mime_type", length: 100 })
  mimeType: string;

  @Column({ name: "size_bytes", type: "bigint" })
  sizeBytes: number;

  @Column({ name: "minio_path", length: 500 })
  minioPath: string;

  @Column({ name: "file_hash", length: 64, unique: true })
  fileHash: string;

  @Column({ name: "extracted_text", type: "text", nullable: true })
  extractedText: string;

  @Column({
    name: "search_vector",
    type: "tsvector",
    nullable: true,
    select: false,
  })
  searchVector: string;

  @Column({
    name: "latest_job_status",
    type: "enum",
    enum: JobStatus,
    default: JobStatus.PENDING,
  })
  latestJobStatus: JobStatus;

  @Column({ name: "latest_job_error_message", type: "text", nullable: true })
  latestJobErrorMessage: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
