import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { LightsModule } from '../Lights/Lights.module';

import { HomeKitService } from './HomeKit.service';

@Module({
  imports: [ConfigModule, LightsModule],
  providers: [HomeKitService],
})
export class HomeKitModule {}
