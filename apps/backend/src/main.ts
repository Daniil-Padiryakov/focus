import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Use Pino logger
  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService);
  const logger = app.get(Logger);

  console.log('configService', configService.isDevelopment);
  console.log('configService', configService.logLevel);
  console.log('configService', configService.logPretty);
  console.log('configService', configService.logPretty);

  // CORS
  app.enableCors({
    origin: configService.corsOrigin,
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Graceful shutdown
  app.enableShutdownHooks();

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
