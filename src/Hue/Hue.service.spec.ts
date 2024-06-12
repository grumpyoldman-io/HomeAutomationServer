import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { model, v3 } from 'node-hue-api';
import type { Api } from 'node-hue-api/dist/esm/api/Api';

import { mockLights } from '@mocks/lights';

import { ENV_PATHS } from '../Constants';
import { NotFoundError } from '../Errors';

import { HueService } from './Hue.service';

jest.mock('node-hue-api');

const MockLightState = {
  hue: jest.fn().mockReturnThis(),
  bri: jest.fn().mockReturnThis(),
  sat: jest.fn().mockReturnThis(),
  ct: jest.fn().mockReturnThis(),
  effect: jest.fn().mockReturnThis(),
  on: jest.fn(() => 'on'),
  off: jest.fn(() => 'off'),
};

const mockHueLights = mockLights.map((light) => ({
  id: light.id,
  name: light.name,
  aFakeProperty: true,
  // All on by default
  state: { on: true },
}));

const MockApi = {
  lights: { getAll: jest.fn(() => mockHueLights), setLightState: jest.fn() },
};

const MockConnector = {
  createRemote: jest.fn().mockReturnThis(),
  createLocal: jest.fn().mockReturnThis(),
  createInsecureLocal: jest.fn().mockReturnThis(),
  connect: jest.fn(() => MockApi as unknown as Api),
};

describe('HueService', () => {
  let service: HueService;
  const mockedV3 = jest.mocked(v3);

  beforeAll(() => {
    mockedV3.lightStates.LightState.mockReturnValue(
      MockLightState as unknown as model.LightState,
    );
    mockedV3.api = MockConnector;
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const Module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: ENV_PATHS,
        }),
      ],
      providers: [HueService],
    }).compile();

    service = Module.get<HueService>(HueService);
  });

  describe('initialization', () => {
    it('validate the config', () => {
      const mockConfig = (config: Record<string, string>) =>
        ({
          getOrThrow: (str: keyof typeof config) => config[str],
        }) as unknown as ConfigService;

      expect(() => new HueService(mockConfig({ HUE_HOST: '' }))).toThrowError(
        'Incorrect bridge host / user',
      );

      expect(() => new HueService(mockConfig({ HUE_USER: '' }))).toThrowError(
        'Incorrect bridge host / user',
      );
    });

    it('should connect to bridge', () => {
      service.onModuleInit();

      expect(MockConnector.createInsecureLocal).toHaveBeenNthCalledWith(
        1,
        process.env.HUE_HOST,
      );
      expect(MockConnector.connect).toHaveBeenNthCalledWith(
        1,
        process.env.HUE_USER,
      );
    });

    it('should reset all the lights', async () => {
      await service.onModuleInit();

      expect(MockApi.lights.setLightState).toHaveBeenCalledTimes(
        mockHueLights.length,
      );
    });
  });

  describe('getLights', () => {
    it('should return a formatted overview of all lights', () => {
      expect(service.getLights()).resolves.toEqual(
        mockLights.map((light) => ({ ...light, brightness: 100, on: true })),
      );
    });
  });

  describe('getLight', () => {
    it('should return a formatted single lights', () => {
      expect(service.getLight(mockLights[0].name)).resolves.toEqual({
        ...mockLights[0],
        on: true,
      });

      // Light not found
      expect(service.getLight('NonExistentLight')).rejects.toEqual(
        new NotFoundError('Light not found'),
      );
    });
  });

  describe('setLightOnOff', () => {
    it('should return a formatted single lights', async () => {
      await service.setLightOnOff(mockLights[0].name, false);

      expect(MockApi.lights.setLightState).toHaveBeenNthCalledWith(1, '1', {
        bri: 254,
        ct: 365,
        effect: 'none',
        hue: 15022,
        on: false,
        sat: 139,
      });

      // Light not found
      expect(service.setLightOnOff('NonExistentLight', true)).rejects.toEqual(
        new NotFoundError('Light not found'),
      );
    });
  });

  describe('setLightBrightness', () => {
    it('should return a formatted single light', async () => {
      await service.setLightBrightness(mockLights[0].name, 50);

      expect(MockApi.lights.setLightState).toHaveBeenCalledWith('1', {
        bri: 126,
        ct: 365,
        effect: 'none',
        hue: 15022,
        on: true,
        sat: 139,
      });

      // Light not found
      expect(
        service.setLightBrightness('NonExistentLight', 50),
      ).rejects.toEqual(new NotFoundError('Light not found'));
    });

    it('should turn the light on if it was off', async () => {
      MockApi.lights.getAll.mockReturnValue(
        mockHueLights.map((light) => ({ ...light, state: { on: false } })),
      );

      const onOffSpy = jest.spyOn(service, 'setLightOnOff');

      await service.setLightBrightness(mockLights[0].name, 50);

      expect(onOffSpy).toHaveBeenCalledWith(mockLights[0].name, true);

      MockApi.lights.getAll.mockReturnValue(mockHueLights);
    });
  });

  describe('toggleLight', () => {
    it('should return a formatted single light', async () => {
      await service.toggleLight(mockLights[0].name);

      expect(MockApi.lights.setLightState).toHaveBeenNthCalledWith(1, '1', {
        bri: 254,
        ct: 365,
        effect: 'none',
        hue: 15022,
        on: false,
        sat: 139,
      });

      // Light not found
      expect(service.toggleLight('NonExistentLight')).rejects.toEqual(
        new NotFoundError('Light not found'),
      );
    });
  });

  describe('storeState', () => {
    it('should store the light states', async () => {
      expect(service.storedState).toEqual({});

      await service.storeState([
        {
          id: '1-color-on',
          type: 'Extended color light',
          state: {
            bri: 1,
            sat: 2,
            xor: true,
            hue: 6,
            effect: 'lala',
            ct: 5,
            on: true,
          },
        },
        {
          id: '2-color-off',
          type: 'Extended color light',
          state: { bri: 1, sat: 2, xor: true, on: false },
        },
        {
          id: '3-dimmable-on',
          type: 'Dimmable light',
          state: { bri: 1, sat: 2, on: true },
        },
      ] as unknown as model.Light[]);

      expect(service.storedState).toEqual({
        '1-color-on': { bri: 1, sat: 2, hue: 6, effect: 'lala', ct: 5 },
        '3-dimmable-on': { bri: 1 },
      });
    });
  });
});
