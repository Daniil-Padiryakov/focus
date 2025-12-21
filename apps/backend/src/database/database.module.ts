import { Global, Module, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseProvider } from './database.provider';

/**
 * Database Module
 * Provides Knex instance для всего приложения
 */

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'KNEX_CONNECTION',
      useFactory: async () => {
        return DatabaseProvider.getConnection();
      },
    },
  ],
  exports: ['KNEX_CONNECTION'],
})
export class DatabaseModule implements OnModuleDestroy {
  async onModuleDestroy() {
    // Graceful shutdown при остановке приложения
    await DatabaseProvider.close();
  }
}
