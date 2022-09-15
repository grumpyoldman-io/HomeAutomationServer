import { Injectable, Logger } from '@nestjs/common';

import { HueService } from '../Hue/Hue.service';
import { LightMap } from '../types';

@Injectable()
export class LightsService {
  private readonly logger = new Logger(LightsService.name);

  constructor(private readonly hue: HueService) {}

  async status(name?: string): Promise<LightMap> {
    if (name === undefined) {
      this.logger.log('Getting status for all');

      const lights = await this.hue.getAllLights();

      const lightMap = lights.reduce<LightMap>(
        (state, light) => ({ ...state, [light.name.toLowerCase()]: light }),
        {},
      );

      return lightMap;
    }

    this.logger.log(`Getting status for ${name}`);

    const light = await this.hue.getLight(name);

    return { [name.toLowerCase()]: light };
  }

  async set(name: string, on: boolean): ReturnType<HueService['setLight']> {
    this.logger.log(`Set light ${name} to ${on ? 'on' : 'off'}`);

    const newState = await this.hue.setLight(name, on);

    return newState;
  }

  async toggle(name: string): ReturnType<HueService['toggleLight']> {
    this.logger.log(`Toggling light ${name} on/off`);

    const newState = await this.hue.toggleLight(name);

    return newState;
  }
}
