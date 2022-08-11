import { Injectable, Logger } from '@nestjs/common';
import { HueService } from './hue.service';
import { LightMap } from './types';

@Injectable()
export class LightService {
  private readonly logger = new Logger(LightService.name);

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

  async toggle(name: string): Promise<string> {
    this.logger.log(`Toggling light ${name} on/off`);

    await this.hue.toggleLight(name);

    return 'ok';
  }
}
