import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LightController } from './lights.controller';
import { LightService } from './lights.service';
import { HueService } from './hue.service';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        ...(process.env.NODE_ENV ?? 'production' === 'production'
          ? ['.env.production.local', '.env.production']
          : []),
        '.env.local',
        '.env',
      ],
    }),
  ],
  controllers: [AppController, LightController],
  providers: [HueService, LightService],
})
export class AppModule {
  private readonly logger = new Logger(AppModule.name);
  static port: string;

  constructor(configService: ConfigService) {
    AppModule.port = configService.get<string>('PORT') ?? '3000';
  }

  onApplicationBootstrap() {
    this.logger.log(`Server starting on http://localhost:${AppModule.port}`);
  }
}
