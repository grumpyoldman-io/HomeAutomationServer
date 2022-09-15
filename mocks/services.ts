import { NotFoundError } from '../src/Errors';
import { HueService } from '../src/Hue/Hue.service';
import { LightsService } from '../src/Lights/Lights.service';

import { mockLights } from './lights';

export const MockHueService: MockService<HueService> = {
  getAllLights: () => mockLights,
  getLight: (name: string) => {
    const light = mockLights.find((light) => light.name === name);

    if (light === undefined) {
      throw new NotFoundError('Light not found');
    }

    return light;
  },
  setLight: (name: string, on: boolean) => {
    const light = mockLights.find((light) => light.name === name);

    if (light === undefined) {
      throw new NotFoundError('Light not found');
    }

    light.on = on;

    return light.on;
  },
  toggleLight: (name: string) => {
    const light = mockLights.find((light) => light.name === name);

    if (light === undefined) {
      throw new NotFoundError('Light not found');
    }

    light.on = !light.on;

    return light.on;
  },
};

export const MockLightsService: MockService<LightsService> = {
  status: jest.fn(async (name?: string) => {
    if (name === undefined) {
      return mockLights.reduce(
        (state, light) => ({ ...state, [light.name.toLowerCase()]: light }),
        {},
      );
    }

    const light = mockLights.find((light) => light.name === name);

    if (light === undefined) {
      throw new NotFoundError('Light not found');
    }

    return {
      [light?.name]: light,
    };
  }),
  set: jest.fn(async (name: string, on: boolean) => {
    const light = mockLights.find((light) => light.name === name);

    if (light === undefined) {
      throw new NotFoundError('Light not found');
    }

    return on;
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
