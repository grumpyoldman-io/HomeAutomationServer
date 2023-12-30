import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { model, v3 } from 'node-hue-api';
import type { Api } from 'node-hue-api/dist/esm/api/Api';

import { NotFoundError } from '../Errors';
import { Light, isLight } from '../types';

type LightType = 'Extended color light' | 'Dimmable light';
type LightLike = model.Light | model.Luminaire | model.Lightsource;
interface InternalState {
  bri?: number;
  hue?: number;
  sat?: number;
  effect?: string;
  ct?: number;
}

@Injectable()
export class HueService {
  private isConnecting = false;
  private isConnected = false;
  private api: Api;

  public storedState: Record<Light['name'], InternalState> = {};

  private readonly logger = new Logger(HueService.name);
  private readonly bridgeConfig: { host: string; user: string };
  private readonly defaultState: InternalState = {
    bri: 254,
    hue: 15022,
    sat: 139,
    effect: 'none',
    ct: 365,
  };

  constructor(private config: ConfigService) {
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

  async getLights(name?: Light['name']): Promise<Light | Light[]> {
    await this.connect();

    const hueLights: LightLike[] = await this.api.lights.getAll();

    const lights = hueLights.map<Light>((hueLight) => {
      const state = hueLight.state as Pick<Light, 'on'>;

      return {
        id: hueLight.id.toString(),
        name: hueLight.name,
        on: state.on,
      };
    });

    if (name === undefined) {
      return lights;
    }

    const light = lights.find(
      (light) => light.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
    );

    if (light === undefined) {
      throw new NotFoundError('Light not found');
    }

    return light;
  }

  async setLight(name: Light['name'], on: Light['on']): Promise<boolean> {
    await this.connect();

    const light = await this.getLights(name);

    if (!isLight(light)) {
      throw new NotFoundError('Light not found');
    }

    await this.api.lights.setLightState(light.id, {
      ...this.storeStateToInternalState(light.id),
      on,
    });

    return on;
  }

  async toggleLight(name: Light['name']): Promise<boolean> {
    await this.connect();

    const light = await this.getLights(name);

    if (!isLight(light)) {
      throw new NotFoundError('Light not found');
    }

    return await this.setLight(name, !light.on);
  }

  async storeState(defaultHueLights?: LightLike[]): Promise<void> {
    await this.connect();

    const hueLights: LightLike[] =
      defaultHueLights ?? (await this.api.lights.getAll());

    this.storedState = hueLights
      .filter((light) => (light.state as { on: boolean }).on)
      .reduce<typeof this.storedState>(
        (acc, light) => ({
          ...acc,
          [light.id]: this.lightStateToStoreState(light),
        }),
        this.storedState,
      );
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
    const lights = await this.getLights();

    if (isLight(lights)) {
      throw new NotFoundError('Lights not found');
    }

    await Promise.all(
      lights
        .filter((light) => light.on)
        .map((light) =>
          this.api.lights.setLightState(light.id, {
            ...this.storeStateToInternalState(light.id),
            on: false,
          }),
        ),
    );
  }

  private lightStateToStoreState({ state, type }: LightLike): InternalState {
    const newState: InternalState = {};

    const { bri, hue, sat, effect, ct } = state as InternalState;
    const lightType: LightType = type as LightType;

    if (bri !== undefined) {
      newState.bri = bri;
    }

    if (hue !== undefined && lightType !== 'Dimmable light') {
      newState.hue = hue;
    }

    if (sat !== undefined && lightType !== 'Dimmable light') {
      newState.sat = sat;
    }

    if (effect !== undefined && lightType !== 'Dimmable light') {
      newState.effect = effect;
    }

    if (ct !== undefined && lightType !== 'Dimmable light') {
      newState.ct = ct;
    }

    return newState;
  }

  private storeStateToInternalState(id: Light['id']): InternalState {
    const state = this.storedState[id] ?? this.defaultState;
    const newState: InternalState = {};

    if (state.bri !== undefined) {
      newState.bri = state.bri;
    }

    if (state.hue !== undefined) {
      newState.hue = state.hue;
    }

    if (state.sat !== undefined) {
      newState.sat = state.sat;
    }

    if (state.effect !== undefined) {
      newState.effect = state.effect;
    }

    if (state.ct !== undefined) {
      newState.ct = state.ct;
    }

    return newState;
  }
}
