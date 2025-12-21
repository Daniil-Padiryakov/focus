import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { validationSchema } from './validation.schema';
import { ConfigService } from './config.service';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      validationOptions: {
        abortEarly: false, // Показать ВСЕ ошибки валидации, не только первую
        allowUnknown: true, // Разрешить неизвестные env vars (для Docker, CI/CD)
      },
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
