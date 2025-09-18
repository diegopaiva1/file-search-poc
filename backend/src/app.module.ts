import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BullModule } from "@nestjs/bull";
import { FilesModule } from "./files/files.module";
import { File } from "./files/entities/file.entity";
import { FileProcessingJob } from "./files/entities/file-processing-job.entity";
import databaseConfig from "./config/database.config";
import redisConfig from "./config/redis.config";
import minioConfig from "./config/minio.config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      load: [databaseConfig, redisConfig, minioConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        url: configService.get("database.url"),
        entities: [File, FileProcessingJob],
        synchronize: false,
        logging: configService.get("database.logging"),
      }),
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get("redis.host"),
          port: configService.get("redis.port"),
        },
      }),
    }),
    FilesModule,
  ],
})
export class AppModule {}
