import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

/**
 * Type-Safe Config Service
 * Предоставляет type-safe доступ к validated configuration
 */

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  // ================================
  // Application
  // ================================
  get nodeEnv(): string {
    try {
      return this.configService.get<string>('nodeEnv', 'development');
    } catch (error) {
      console.error('❌ Error getting NODE_ENV:', error);
      return 'development';
    }
  }

  get port(): number {
    return this.configService.get<number>('port', 3000);
  }

  get isDevelopment(): boolean {
    try {
      return this.nodeEnv === 'development';
    } catch (error) {
      console.error('❌ Error getting isDevelopment:', error);
      return false;
    }
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  // ================================
  // Database
  // ================================
  get databaseConfig() {
    return {
      host: this.configService.get<string>('database.host'),
      port: this.configService.get<number>('database.port'),
      user: this.configService.get<string>('database.user'),
      password: this.configService.get<string>('database.password'),
      name: this.configService.get<string>('database.name'),
      pool: {
        min: this.configService.get<number>('database.pool.min'),
        max: this.configService.get<number>('database.pool.max'),
        idleTimeout: this.configService.get<number>(
          'database.pool.idleTimeout',
        ),
        acquireTimeout: this.configService.get<number>(
          'database.pool.acquireTimeout',
        ),
      },
      ssl: this.configService.get<boolean>('database.ssl'),
      debug: this.configService.get<boolean>('database.debug'),
    };
  }

  // ================================
  // Authentication
  // ================================
  get jwtSecret(): string {
    const secret = this.configService.get<string>('jwt.secret');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    return secret;
  }

  get jwtExpiresIn(): string {
    return this.configService.get<string>('jwt.expiresIn', '7d');
  }

  // ================================
  // Security
  // ================================
  get corsOrigin(): string[] {
    return this.configService.get<string[]>('cors.origin', [
      'http://localhost:5173',
    ]);
  }

  get rateLimitTtl(): number {
    return this.configService.get<number>('rateLimit.ttl', 60);
  }

  get rateLimitMax(): number {
    return this.configService.get<number>('rateLimit.max', 100);
  }

  // ================================
  // Logging
  // ================================
  get logLevel(): string {
    try {
      return this.configService.get<string>('logging.level', 'info');
    } catch (error) {
      console.error('❌ Error getting LOG_LEVEL:', error);
      return 'info';
    }
  }

  get logPretty(): boolean {
    try {
      return this.configService.get<boolean>('logging.pretty', true);
    } catch (error) {
      console.error('❌ Error getting LOG_PRETTY:', error);
      return false;
    }
  }
}
