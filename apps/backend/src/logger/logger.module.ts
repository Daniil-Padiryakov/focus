// @ts-nocheck
import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { ConfigService } from '@/config/config.service';
import { ConfigModule } from '@/config/config.module';

/**
 * Logger Module
 * Structured JSON logging с Pino (faster чем Winston)
 */

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isDevelopment = configService.isDevelopment;
        const logLevel = configService.logLevel;
        const pretty = configService.logPretty;

        return {
          pinoHttp: {
            level: logLevel,

            // Pretty print в development, JSON в production
            transport:
              pretty && isDevelopment
                ? {
                    target: 'pino-pretty',
                    options: {
                      colorize: true,
                      translateTime: 'yyyy-mm-dd HH:MM:ss',
                      ignore: 'pid,hostname',
                      singleLine: false,
                      messageFormat: '{req.method} {req.url} {msg}',
                    },
                  }
                : undefined,

            // Custom serializers
            serializers: {
              req: (req: any) => ({
                id: req.id,
                method: req.method,
                url: req.url,
                query: req.query,
                params: req.params,
                // НЕ логируем body (может содержать passwords!)
              }),
              res: (res: any) => ({
                statusCode: res.statusCode,
              }),
            },

            // Auto-log requests
            autoLogging: {
              ignore: (req: any) => {
                // Ignore health check logs (too noisy)
                return req.url === '/health' || req.url === '/api/health';
              },
            },

            // Custom log levels
            customLevels: {
              http: 25,
            },

            // Base logging object
            base: {
              env: configService.nodeEnv,
            },
          },
        };
      },
    }),
  ],
})
export class LoggerModule {}
