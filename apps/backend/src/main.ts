import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { Logger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Use Pino logger
  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService);
  const logger = app.get(Logger);

  // CORS
  app.enableCors({
    origin: configService.corsOrigin,
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Graceful shutdown
  app.enableShutdownHooks();

  app.useGlobalPipes(new ValidationPipe());

  const port = configService.port;
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
  logger.log(`📝 Environment: ${configService.nodeEnv}`);
  logger.log(
    `🗄️  Database: ${configService.databaseConfig.host}:${configService.databaseConfig.port}`,
  );
  logger.log(`📊 Log Level: ${configService.logLevel}`);
}

bootstrap();
