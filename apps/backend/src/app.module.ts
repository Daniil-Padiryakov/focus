import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    ConfigModule, // Config с валидацией
    LoggerModule, // Structured logging
    DatabaseModule, // Database с connection pooling
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
