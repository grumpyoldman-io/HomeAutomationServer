import { HomeKitService } from 'src/HomeKit/HomeKit.service';

import { NotFoundError } from '../src/Errors';
import { HueService } from '../src/Hue/Hue.service';
import { LightsService } from '../src/Lights/Lights.service';

import { mockLights } from './lights';

let mockStoredState = {};

export const MockHueService: MockService<HueService> = {
  getLights: () => mockLights,
  getLight: (name: string) => {
    const light = mockLights.find((light) => light.name === name);

    if (light === undefined) {
      throw new NotFoundError('Light not found');
    }

    return light;
  },
  setLightOnOff: (name: string, on: boolean) => {
    const light = mockLights.find((light) => light.name === name);

    if (light === undefined) {
      throw new NotFoundError('Light not found');
    }

    light.on = on;

    return light.on;
  },
  setLightBrightness: (name: string, value: number) => {
    const light = mockLights.find((light) => light.name === name);

    if (light === undefined) {
      throw new NotFoundError('Light not found');
    }

    light.brightness = value;

    return light.brightness;
  },
  toggleLight: (name: string) => {
    const light = mockLights.find((light) => light.name === name);

    if (light === undefined) {
      throw new NotFoundError('Light not found');
    }

    light.on = !light.on;

    return light.on;
  },
  storeState: jest.fn(async () => {
    mockStoredState = mockLights;
  }),
  storedState: () => mockStoredState,
};

export const MockHomeKitService = {
  bridgeUuid: 'mock-home-kit-bridge',
} as unknown as MockService<HomeKitService>;

export const MockLightsService: MockService<LightsService> = {
  status: jest.fn(async (name: string) => {
    const light = mockLights.find((light) => light.name === name);

    if (light === undefined) {
      throw new NotFoundError('Light not found');
    }

    return light;
  }),
  statusAll: jest.fn(async () => mockLights),
  toggleAll: jest.fn(async () => {
    return mockLights;
  }),
  store: jest.fn(),
  setOnOff: jest.fn(async (name: string, on: boolean) => {
    const light = mockLights.find((light) => light.name === name);

    if (light === undefined) {
      throw new NotFoundError('Light not found');
    }

    return on;
  }),
  setBrightness: jest.fn(async (name: string, value: number) => {
    const light = mockLights.find((light) => light.name === name);

    if (light === undefined) {
      throw new NotFoundError('Light not found');
    }

    return value;
  }),
  toggle: jest.fn(async (name: string) => {
    const light = mockLights.find((light) => light.name === name);

    if (light === undefined) {
      throw new NotFoundError('Light not found');
    }

    return !light.on;
  }),
};

type MockService<S> = Record<
  Exclude<keyof S, 'onModuleInit'>,
  (...args: unknown[]) => Promise<unknown> | unknown
>;
