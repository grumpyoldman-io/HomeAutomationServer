import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './App.controller';
import { ENV_PATHS } from './Constants';
import { LightsModule } from './Lights/Lights.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ENV_PATHS,
    }),
    LightsModule,
  ],
  controllers: [AppController],
})
export class AppModule {
  private readonly logger = new Logger(AppModule.name);
  static port: string;

  constructor(configService: ConfigService) {
    AppModule.port = configService.getOrThrow<string>('PORT');
  }

  onApplicationBootstrap() {
    this.logger.log(`Server starting on http://localhost:${AppModule.port}`);
  }
}
