import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './App.controller';
import { ENV_PATHS } from './Constants';
import { HomeKitModule } from './HomeKit/HomeKit.module';
import { LightsModule } from './Lights/Lights.module';

@Module({
  providers: [Logger],
  imports: [
    ConfigModule.forRoot({
      envFilePath: ENV_PATHS,
    }),
    LightsModule,
    HomeKitModule,
  ],
  controllers: [AppController],
})
export class AppModule {
  static port: string;

  constructor(configService: ConfigService, private readonly logger: Logger) {
    AppModule.port = configService.getOrThrow<string>('PORT');
  }

  onApplicationBootstrap() {
    this.logger.log(`Server starting on http://localhost:${AppModule.port}`);
  }
}
