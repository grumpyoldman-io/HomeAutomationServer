import { Injectable, Logger } from '@nestjs/common';

import { HueService } from '../Hue/Hue.service';
import { Light } from '../types';

@Injectable()
export class LightsService {
  private readonly logger = new Logger(LightsService.name);

  constructor(private readonly hue: HueService) {}

  async status(name: string): Promise<Light> {
    this.logger.log(`Getting status for ${name}`);

    const light = await this.hue.getLight(name);

    return light;
  }

  async statusAll(): Promise<Light[]> {
    this.logger.log('Getting status for all');

    const lights = await this.hue.getLights();

    return lights;
  }

  async toggleAll(): ReturnType<HueService['getLights']> {
    this.logger.log(`Toggling all lights on/off`);

    const lights = await this.hue.getLights();

    const lightsThatAreOn = lights.filter((light) => light.on);
    const lightsThatAreOff = lights.filter((light) => !light.on);

    // If more than half of the lights are on, we turn them off
    if (lightsThatAreOn.length >= lightsThatAreOff.length) {
      await Promise.all(
        lightsThatAreOn.map((light) => this.setOnOff(light.name, false)),
      );

      return lights.map((light) => ({ ...light, on: false }));
    }

    // Otherwise we turn them on
    await Promise.all(
      lightsThatAreOff.map((light) => this.setOnOff(light.name, true)),
    );

    return lights.map((light) => ({ ...light, on: true }));
  }

  async store(): Promise<void> {
    this.logger.log(`Storing status`);

    await this.hue.storeState();
  }

  async setOnOff(
    name: string,
    on: boolean,
  ): ReturnType<HueService['setLightOnOff']> {
    this.logger.log(`Set light ${name} to ${on ? 'on' : 'off'}`);

    const newState = await this.hue.setLightOnOff(name, on);

    return newState;
  }

  async setBrightness(
    name: string,
    value: number, // 1-100
  ): ReturnType<HueService['setLightBrightness']> {
    this.logger.log(`Set light ${name} brightness to ${value}`);

    const newState = await this.hue.setLightBrightness(name, value);

    return newState;
  }

  async toggle(name: string): ReturnType<HueService['toggleLight']> {
    this.logger.log(`Toggling light ${name} on/off`);

    const newState = await this.hue.toggleLight(name);

    return newState;
  }
}
