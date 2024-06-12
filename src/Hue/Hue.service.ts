import { writeFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { cwd } from 'node:process';

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { model, v3 } from 'node-hue-api';
import type { Api } from 'node-hue-api/dist/esm/api/Api';

import { NotFoundError } from '../Errors';
import { Light } from '../types';

type LightType = 'Extended color light' | 'Dimmable light';
type LightLike = model.Light | model.Luminaire | model.Lightsource;
interface InternalState {
  bri?: number;
  hue?: number;
  sat?: number;
  effect?: string;
  ct?: number;
}

const STORE_FILE_PATH = resolve(cwd(), 'persist/stored-hue-state.json');

@Injectable()
export class HueService {
  private isConnecting = false;
  private isConnected = false;
  private api: Api;

  public storedState: Record<Light['name'], InternalState> = {};

  private readonly logger = new Logger(HueService.name);
  private readonly bridgeConfig: { host: string; user: string };
  private readonly defaultState = {
    bri: 254,
    hue: 15022,
    sat: 139,
    effect: 'none',
    ct: 365,
  } satisfies InternalState;

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
    await this.readStoredStateFromFile();
  }

  async getLights(): Promise<Light[]> {
    await this.connect();

    const hueLights: LightLike[] = await this.api.lights.getAll();

    const lights = hueLights.map<Light>((hueLight) => {
      const state = hueLight.state as Pick<Light, 'on'>;

      return {
        id: hueLight.id.toString(),
        name: hueLight.name,
        on: state.on,
        brightness: Math.round(
          (((hueLight.state as InternalState).bri ?? 254 - 1) / 253) * 99 + 1,
        ),
      };
    });

    return lights;
  }

  async getLight(name: Light['name']): Promise<Light> {
    const lights = await this.getLights();

    const light = lights.find(
      (light) => light.name.toLocaleLowerCase() === name.toLocaleLowerCase(),
    );

    if (light === undefined) {
      throw new NotFoundError('Light not found');
    }

    return light;
  }

  async setLightOnOff(name: Light['name'], on: Light['on']): Promise<boolean> {
    await this.connect();

    const light = await this.getLight(name);

    await this.api.lights.setLightState(light.id, {
      ...this.storeStateToInternalState(light.id),
      on,
    });

    return on;
  }

  async setLightBrightness(
    name: Light['name'],
    value: Light['brightness'], // 1-100
  ): Promise<Light['brightness']> {
    await this.connect();

    const light = await this.getLight(name);

    const bri = Math.round(((value - 1) / 99) * 253 + 1);

    if (bri > 0 && !light.on) {
      light.on = await this.setLightOnOff(name, true);
    }

    await this.api.lights.setLightState(light.id, {
      ...this.storeStateToInternalState(light.id),
      on: light.on,
      bri,
    });

    return value;
  }

  async toggleLight(name: Light['name']): Promise<boolean> {
    await this.connect();

    const light = await this.getLight(name);

    return await this.setLightOnOff(name, !light.on);
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

    await this.writeStoredStateToFile();
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

  private async readStoredStateFromFile(): Promise<typeof this.storedState> {
    try {
      const file = await readFile(STORE_FILE_PATH, 'utf-8');

      this.storedState = JSON.parse(file);

      this.logger.log(
        `Previous state found for the following lights: ${Object.keys(
          this.storedState,
        ).join(', ')}`,
      );
    } catch (error) {
      this.logger.warn('Error reading stored state from file', error);

      this.storedState = this.storedState ?? {};
    }

    return this.storedState;
  }

  private async writeStoredStateToFile(): Promise<void> {
    await writeFile(STORE_FILE_PATH, JSON.stringify(this.storedState));
  }
}
