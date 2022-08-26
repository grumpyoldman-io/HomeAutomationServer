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
  toggleLight: (name: string) => {
    const light = mockLights.find((light) => light.name === name);

    if (light === undefined) {
      throw new NotFoundError('Light not found');
    }

    light.on = !light.on;

    return 'ok';
  },
};

export const MockLightsService: MockService<LightsService> = {
  status: (name?: string) => {
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
  },
  toggle: (name: string) => {
    const light = mockLights.find((light) => light.name === name);

    if (light === undefined) {
      throw new NotFoundError('Light not found');
    }

    return 'ok';
  },
};

type MockService<S> = Record<
  Exclude<keyof S, 'onModuleInit'>,
  (...args: unknown[]) => Promise<unknown> | unknown
>;
