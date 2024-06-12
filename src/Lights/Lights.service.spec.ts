import { Test, TestingModule } from '@nestjs/testing';

import { mockLights } from '@mocks/lights';
import { MockHueService } from '@mocks/services';

import { NotFoundError } from '../Errors';
import { HueModule } from '../Hue/Hue.module';
import { HueService } from '../Hue/Hue.service';

import { LightsService } from './Lights.service';

describe('LightsService', () => {
  let service: LightsService;

  beforeEach(async () => {
    const Module: TestingModule = await Test.createTestingModule({
      imports: [HueModule],
      providers: [LightsService],
    })
      .overrideProvider(HueService)
      .useValue(MockHueService)
      .compile();

    service = Module.get<LightsService>(LightsService);
  });

  it('should be able to fetch the status for all lights', async () => {
    const status = await service.statusAll();

    expect(status).toMatchObject(mockLights);
  });

  it('should be able to fetch the status for a single light', async () => {
    const status = await service.status(mockLights[1].name);
    expect(status).toMatchObject(mockLights[1]);

    // Light not found
    expect(service.status('NonExistentLight')).rejects.toEqual(
      new NotFoundError('Light not found'),
    );
  });

  it('should be able to toggle the status for all lights', async () => {
    const status = await service.statusAll();

    expect(status[0]).toHaveProperty('on', false);
    expect(status[1]).toHaveProperty('on', false);

    await service.toggleAll();

    expect(status[0]).toHaveProperty('on', true);
    expect(status[1]).toHaveProperty('on', true);

    await service.toggleAll();
  });

  it('should be able to set the on/off state for a single light', async () => {
    const responseOn = await service.setOnOff(mockLights[1].name, true);
    expect(responseOn).toBe(true);
    const responseOff = await service.setOnOff(mockLights[1].name, false);
    expect(responseOff).toBe(false);

    // Light not found
    expect(service.setOnOff('NonExistentLight', true)).rejects.toEqual(
      new NotFoundError('Light not found'),
    );
  });

  it('should be able to toggle the on/off state for a single light', async () => {
    const responseOn = await service.toggle(mockLights[1].name);
    expect(responseOn).toBe(true);
    const responseOff = await service.toggle(mockLights[1].name);
    expect(responseOff).toBe(false);

    // Light not found
    expect(service.toggle('NonExistentLight')).rejects.toEqual(
      new NotFoundError('Light not found'),
    );
  });

  it('should be able to set the brightness state for a single light', async () => {
    const newBrightness = Math.floor(Math.random() * 100);

    const response = await service.setBrightness(
      mockLights[1].name,
      newBrightness,
    );

    expect(response).toBe(newBrightness);

    // Light not found
    expect(service.setBrightness('NonExistentLight', 100)).rejects.toEqual(
      new NotFoundError('Light not found'),
    );
  });
});
