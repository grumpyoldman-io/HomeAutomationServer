import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import {
  Bridge,
  uuid,
  Accessory,
  Service,
  Characteristic,
  Categories,
} from 'hap-nodejs';
import {
  AccessoryInformation,
  Lightbulb,
} from 'hap-nodejs/dist/lib/definitions';
import waitForExpect from 'wait-for-expect';

import { mockLights } from '@mocks/lights';
import { MockLightsService } from '@mocks/services';

import { ENV_PATHS } from '../Constants';
import { LightsModule } from '../Lights/Lights.module';
import { LightsService } from '../Lights/Lights.service';

import { HomeKitService } from './HomeKit.service';

jest.mock('hap-nodejs');

describe('HomeKitService', () => {
  let service: HomeKitService;

  const mockBridge = {
    addBridgedAccessory: jest.fn(),
    publish: jest.fn(),
  } as unknown as Bridge;

  const mockCharacteristic = new Characteristic('mock', 'mock-uuid', {
    format: 'mock-format',
    perms: [],
  });
  const characteristicGetSpy = jest.spyOn(mockCharacteristic, 'onGet');
  const characteristicSetSpy = jest.spyOn(mockCharacteristic, 'onSet');

  const mockLightbulb = jest.fn(
    () =>
      ({
        getCharacteristic: jest.fn(() => mockCharacteristic),
      } as unknown as Lightbulb),
  );

  const mockSetCharacteristic = jest.fn();

  const mockAccessory = {
    addService: jest.fn(),
  } as unknown as Accessory;

  const mockedAccessory = jest.mocked(Accessory, true);
  const mockedBridge = jest.mocked(Bridge, true);
  const mockedService = jest.mocked(Service, true);
  const mockedUuid = jest.mocked(uuid, true);

  beforeAll(() => {
    mockedAccessory.mockReturnValue(mockAccessory);
    mockedBridge.mockReturnValue(mockBridge);
    mockedService.Lightbulb.mockImplementation(mockLightbulb);
    mockedService.AccessoryInformation.mockReturnValue({
      setCharacteristic: mockSetCharacteristic,
    } as unknown as AccessoryInformation);
    mockedUuid.generate.mockImplementation((str: string) => str);
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const Module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: ENV_PATHS,
        }),
        LightsModule,
      ],
      providers: [HomeKitService],
    })
      .overrideProvider(LightsService)
      .useValue(MockLightsService)
      .compile();

    service = Module.get<HomeKitService>(HomeKitService);
  });

  describe('initialization', () => {
    it('validate the config', () => {
      const mockConfig = (config: Record<string, string>) =>
        ({
          getOrThrow: (str: keyof typeof config) => config[str],
        } as unknown as ConfigService);

      expect(
        () =>
          new HomeKitService(
            mockConfig({ HOMEKIT_MAC_ADDRESS: '00:00:00:00:00:00' }),
            {} as unknown as LightsService,
          ),
      ).toThrowError('Please change the default HOMEKIT_MAC_ADDRESS');

      expect(
        () =>
          new HomeKitService(
            mockConfig({
              HOMEKIT_MAC_ADDRESS: '00:00:00:00:00:01',
              HOMEKIT_PIN: '000-00-000',
            }),
            {} as unknown as LightsService,
          ),
      ).toThrowError('Please change the default HOMEKIT_PIN');
    });

    it('should create the bridge', () => {
      expect(mockedBridge).toHaveBeenNthCalledWith(
        1,
        'MOCK-HOMEKIT-NAME',
        uuid.generate('hap.hub'),
      );
    });

    it('should have the correct information', () => {
      expect(mockSetCharacteristic).toHaveBeenCalledWith(
        Characteristic.Name,
        'MOCK-HOMEKIT-NAME',
      );
      expect(mockSetCharacteristic).toHaveBeenCalledWith(
        Characteristic.Manufacturer,
        'Grumpy Old Man',
      );
      expect(mockSetCharacteristic).toHaveBeenCalledWith(
        Characteristic.Model,
        'GOMBridge',
      );
      expect(mockSetCharacteristic).toHaveBeenCalledWith(
        Characteristic.Version,
        '1.0.0',
      );
    });

    it('should connect to bridge', async () => {
      service.onModuleInit();

      // Make sure all code has executed
      await waitForExpect(() => expect(mockBridge.publish).toHaveBeenCalled());

      // Check creation of light bulbs
      expect(mockLightbulb).toHaveBeenCalledTimes(mockLights.length);
      mockLights.map((light) =>
        expect(mockLightbulb).toHaveBeenCalledWith(light.name),
      );

      // Check if light bulbs have been attached
      expect(mockBridge.addBridgedAccessory).toHaveBeenNthCalledWith(
        2,
        mockAccessory,
      );

      // Check if the bridge has been properly published
      expect(mockBridge.publish).toHaveBeenCalledWith({
        addIdentifyingMaterial: false,
        category: Categories.BRIDGE,
        pincode: 'MOCK-PIN',
        port: 47128,
        username: 'MOCK-MAC-ADDRESS',
      });
    });
  });

  describe('events', () => {
    it('should attach the correct events', async () => {
      service.onModuleInit();

      // Make sure all code has executed
      await waitForExpect(() => expect(mockBridge.publish).toHaveBeenCalled());

      expect(characteristicGetSpy).toHaveBeenCalledTimes(mockLights.length);
      expect(characteristicSetSpy).toHaveBeenCalledTimes(mockLights.length);
    });

    it('should handle the "get" event', async () => {
      service.onModuleInit();

      // Make sure all code has executed
      await waitForExpect(() => expect(mockBridge.publish).toHaveBeenCalled());

      const result = await characteristicGetSpy.mock.calls[0][0]({});

      expect(MockLightsService.status).toBeCalledWith(mockLights[0].name);

      expect(result).toBe(mockLights[0].on);
    });

    it('should handle the "set" event', async () => {
      service.onModuleInit();

      // Make sure all code has executed
      await waitForExpect(() => expect(mockBridge.publish).toHaveBeenCalled());

      const result = await characteristicSetSpy.mock.calls[0][0](
        'mock-state',
        {},
      );

      expect(MockLightsService.set).toBeCalledWith(
        mockLights[0].name,
        'mock-state',
      );

      expect(result).toBeUndefined();
    });
  });
});
