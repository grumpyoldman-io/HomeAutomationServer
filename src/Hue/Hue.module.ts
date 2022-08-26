import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { HueService } from './Hue.service';

@Module({
  imports: [ConfigModule],
  providers: [HueService],
  exports: [HueService],
})
export class HueModule {}
