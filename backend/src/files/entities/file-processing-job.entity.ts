import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { File } from "./file.entity";

export enum JobStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

@Entity("file_processing_jobs")
export class FileProcessingJob {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "file_id" })
  fileId: string;

  @ManyToOne(() => File, { onDelete: "CASCADE" })
  @JoinColumn({ name: "file_id" })
  file: File;

  @Column({
    type: "enum",
    enum: JobStatus,
    default: JobStatus.PENDING,
  })
  status: JobStatus;

  @Column({ name: "error_message", type: "text", nullable: true })
  errorMessage: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
