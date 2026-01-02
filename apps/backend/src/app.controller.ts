import { Controller, Get } from '@nestjs/common';
import { ConfigService } from './config/config.service';

@Controller()
export class AppController {
  constructor(private readonly configService: ConfigService) {}

  @Get('live')
  live() {
    return 'ok';
  }

  @Get('health')
  getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: this.configService.nodeEnv,
      port: this.configService.port,
    };
  }

  @Get('config')
  getConfig() {
    // НЕ expose secrets в production!
    if (this.configService.isProduction) {
      return { error: 'Config endpoint disabled in production' };
    }

    return {
      environment: this.configService.nodeEnv,
      port: this.configService.port,
      database: {
        host: this.configService.databaseConfig.host,
        port: this.configService.databaseConfig.port,
        name: this.configService.databaseConfig.name,
        // НЕ показываем password!
      },
      cors: this.configService.corsOrigin,
      logging: {
        level: this.configService.logLevel,
        pretty: this.configService.logPretty,
      },
    };
  }
}
// Test hot reload
