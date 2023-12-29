import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Accessory,
  Categories,
  Characteristic,
  Service,
  uuid,
  Bridge,
} from 'hap-nodejs';

import { LightsService } from '../Lights/Lights.service';
import { Light, isLight } from '../types';

@Injectable()
export class HomeKitService {
  public readonly bridgeUuid = uuid.generate('hap.hub');
  private readonly bridge: Bridge;
  private readonly logger = new Logger(HomeKitService.name);

  constructor(
    private config: ConfigService,
    private lights: LightsService,
  ) {
    if (
      this.config.getOrThrow<string>('HOMEKIT_MAC_ADDRESS') ===
      '00:00:00:00:00:00'
    ) {
      throw new Error('Please change the default HOMEKIT_MAC_ADDRESS');
    }

    if (this.config.getOrThrow<string>('HOMEKIT_PIN') === '000-00-000') {
      throw new Error('Please change the default HOMEKIT_PIN');
    }

    this.bridge = new Bridge(
      this.config.getOrThrow<string>('HOMEKIT_NAME'),
      this.bridgeUuid,
    );

    const informationService = new Service.AccessoryInformation();
    informationService.setCharacteristic(
      Characteristic.Name,
      this.config.getOrThrow<string>('HOMEKIT_NAME'),
    );
    informationService.setCharacteristic(
      Characteristic.Manufacturer,
      'Grumpy Old Man',
    );
    informationService.setCharacteristic(Characteristic.Model, 'GOMBridge');
    informationService.setCharacteristic(Characteristic.Version, '1.0.0');
  }

  async onModuleInit() {
    const lightMap = await this.lights.status();

    this.logger.log(`Creating HAP lights`);

    if (isLight(lightMap)) {
      throw new Error('Lights not found');
    }

    lightMap
      .map((light) => this.createSimpleLight(light))
      .forEach((light) => this.bridge.addBridgedAccessory(light));

    this.bridge.publish({
      username: this.config.getOrThrow<string>('HOMEKIT_MAC_ADDRESS'),
      pincode: this.config.getOrThrow<string>('HOMEKIT_PIN'),
      port: 47128,
      category: Categories.BRIDGE,
      addIdentifyingMaterial: false,
    });

    this.logger.log(`Published bridge`);
  }

  private createSimpleLight(light: Light) {
    this.logger.log(`Creating HAP light: ${light.name}`);

    const accessory = new Accessory(
      light.name,
      uuid.generate(`hap.hub.${light.name}`),
    );
    const lightBulb = new Service.Lightbulb(light.name);

    const characteristic = lightBulb.getCharacteristic(Characteristic.On);

    characteristic.onGet(async () => {
      const lightState = await this.lights.status(light.name);

      if (!isLight(lightState)) {
        throw new Error('Light not found');
      }

      return lightState.on;
    });

    characteristic.onSet(async (value) => {
      await this.lights.set(light.name, value as boolean);
    });

    accessory.addService(lightBulb);

    return accessory;
  }
}
