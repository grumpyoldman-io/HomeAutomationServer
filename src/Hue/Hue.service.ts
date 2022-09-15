import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { model, v3 } from 'node-hue-api';
import type { Api } from 'node-hue-api/dist/esm/api/Api';

import { NotFoundError } from '../Errors';
import { Light } from '../types';

@Injectable()
export class HueService {
  private isConnecting = false;
  private isConnected = false;
  private api: Api;
  private readonly logger = new Logger(HueService.name);

  private readonly bridgeConfig: { host: string; user: string };
  private readonly states: { on: model.LightState; off: model.LightState };

  constructor(private config: ConfigService) {
    this.states = {
      on: new v3.lightStates.LightState()
        .bri(254)
        .hue(14948)
        .sat(143)
        .ct(365)
        .effect('none')
        .on(),
      off: new v3.lightStates.LightState()
        .bri(254)
        .hue(14948)
        .sat(143)
        .ct(365)
        .effect('none')
        .off(),
    };

    const bridgeHost = config.getOrThrow<string>('HUE_HOST');
    const bridgeUser = config.getOrThrow<string>('HUE_USER');

    if (bridgeHost === '' || bridgeUser === '') {
      throw new Error('Incorrect bridge host / user');
    }

    this.bridgeConfig = {
      host: bridgeHost,
      user: bridgeUser,
    };
  }

  async onModuleInit() {
    await this.connect();
  }

  async getAllLights(): Promise<Light[]> {
    await this.connect();

    const hueLights = await this.api.lights.getAll();

    const lights = hueLights.map<Light>((hueLight) => {
      const state = hueLight.state as Pick<Light, 'on'>;

      return {
        id: hueLight.id.toString(),
        name: hueLight.name,
        on: state.on,
      };
    });

    return lights;
  }

  async getLight(name: Light['name']): Promise<Light> {
    await this.connect();

    const lights = await this.getAllLights();

    const saveName = name.toLowerCase();

    const light = lights.find((light) => light.name.toLowerCase() === saveName);

    if (light === undefined) {
      throw new NotFoundError('Light not found');
    }

    return light;
  }

  async setLight(name: Light['name'], on: Light['on']): Promise<boolean> {
    await this.connect();

    const lights = await this.getAllLights();

    const saveName = name.toLowerCase();

    const light = lights.find((light) => light.name.toLowerCase() === saveName);

    if (light === undefined) {
      throw new NotFoundError('Light not found');
    }

    if (light.on === on) {
      return on;
    }

    await this.api.lights.setLightState(
      light.id,
      on ? this.states.on : this.states.off,
    );

    return on;
  }

  async toggleLight(name: Light['name']): Promise<boolean> {
    await this.connect();

    const lights = await this.getAllLights();

    const saveName = name.toLowerCase();

    const light = lights.find((light) => light.name.toLowerCase() === saveName);

    if (light === undefined) {
      throw new NotFoundError('Light not found');
    }

    await this.api.lights.setLightState(
      light.id,
      light.on ? this.states.off : this.states.on,
    );

    return !light.on;
  }

  private async connect(): Promise<void> {
    if (this.isConnecting || this.isConnected) {
      return;
    }

    this.logger.log('Connecting to Hue bridge...');

    this.isConnecting = true;

    try {
      this.api = await v3.api
        .createInsecureLocal(this.bridgeConfig.host)
        .connect(this.bridgeConfig.user);

      this.isConnected = true;

      this.logger.log('Connected!');

      if (this.config.get('NODE_ENV') !== 'development') {
        await this.reset();
      }
    } catch (error) {
      this.logger.error('Error connecting to Hue bridge', error);
    }

    this.isConnecting = false;
  }

  private async reset(): Promise<void> {
    this.logger.log('Resetting lights');

    await this.connect();
    const lights = await this.getAllLights();

    await Promise.all(
      lights
        .filter((light) => light.on)
        .map((light) =>
          this.api.lights.setLightState(light.id, this.states.off),
        ),
    );
  }
}
