import { Injectable, Logger } from '@nestjs/common';

import { HueService } from '../Hue/Hue.service';
import { Light } from '../types';

@Injectable()
export class LightsService {
  private readonly logger = new Logger(LightsService.name);

  constructor(private readonly hue: HueService) {}

  async status(name?: string): Promise<Light | Light[]> {
    if (name === undefined) {
      this.logger.log('Getting status for all');

      const lights = await this.hue.getAllLights();

      return lights;
    }

    this.logger.log(`Getting status for ${name}`);

    const light = await this.hue.getLight(name);

    return light;
  }

  async toggleAll(): ReturnType<HueService['getAllLights']> {
    this.logger.log(`Toggling all lights on/off`);

    const lights = await this.hue.getAllLights();

    const lightsThatAreOn = lights.filter((light) => light.on);
    const lightsThatAreOff = lights.filter((light) => !light.on);

    // If more than half of the lights are on, we turn them off
    if (lightsThatAreOn.length >= lightsThatAreOff.length) {
      await Promise.all(
        lightsThatAreOn.map((light) => this.set(light.name, false)),
      );

      return lights.map((light) => ({ ...light, on: false }));
    }

    // Otherwise we turn them on
    await Promise.all(
      lightsThatAreOff.map((light) => this.set(light.name, true)),
    );

    return lights.map((light) => ({ ...light, on: true }));
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
