import { registerAs } from "@nestjs/config";

export interface MinioConfig {
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  bucketName: string;
}

export default registerAs(
  "minio",
  (): MinioConfig => ({
    endPoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_API_PORT, 10) || 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
    bucketName: process.env.MINIO_BUCKET_NAME,
  })
);
