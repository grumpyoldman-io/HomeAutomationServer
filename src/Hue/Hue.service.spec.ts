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

    it('should create the default light state', () => {
      expect(MockLightState.bri).toHaveBeenNthCalledWith(1, 254);
      expect(MockLightState.hue).toHaveBeenNthCalledWith(1, 14948);
      expect(MockLightState.sat).toHaveBeenNthCalledWith(1, 143);
      expect(MockLightState.ct).toHaveBeenNthCalledWith(1, 365);
      expect(MockLightState.effect).toHaveBeenNthCalledWith(1, 'none');
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

  describe('getAllLights', () => {
    it('should return a formatted overview of all lights', () => {
      expect(service.getAllLights()).resolves.toEqual(
        mockLights.map((light) => ({ ...light, on: true })),
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

  describe('setLight', () => {
    it('should return a formatted single lights', async () => {
      await service.setLight(mockLights[0].name, false);

      expect(MockApi.lights.setLightState).toHaveBeenNthCalledWith(
        1,
        '1',
        'off',
      );

      // Light not found
      expect(service.setLight('NonExistentLight', true)).rejects.toEqual(
        new NotFoundError('Light not found'),
      );
    });
  });

  describe('toggleLight', () => {
    it('should return a formatted single lights', async () => {
      await service.toggleLight(mockLights[0].name);

      expect(MockApi.lights.setLightState).toHaveBeenNthCalledWith(
        1,
        '1',
        'off',
      );

      // Light not found
      expect(service.toggleLight('NonExistentLight')).rejects.toEqual(
        new NotFoundError('Light not found'),
      );
    });
  });
});
