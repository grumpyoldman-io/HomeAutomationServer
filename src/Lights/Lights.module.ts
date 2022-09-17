import { Module } from '@nestjs/common';

import { HueModule } from '../Hue/Hue.module';

import { LightsController } from './Lights.controller';
import { LightsService } from './Lights.service';

@Module({
  imports: [HueModule],
  controllers: [LightsController],
  providers: [LightsService],
  exports: [LightsService],
})
export class LightsModule {}
