import { Test, TestingModule } from '@nestjs/testing';

import { mockLights } from '@mocks/lights';
import { MockHueService } from '@mocks/services';

import { NotFoundError } from '../Errors';
import { HueModule } from '../Hue/Hue.module';
import { HueService } from '../Hue/Hue.service';
import { isLight } from '../types';

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
    const status = await service.status();

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
    const status = await service.status();

    if (isLight(status)) {
      throw new Error('Expected status to be an object');
    }

    expect(status[0]).toHaveProperty('on', false);
    expect(status[1]).toHaveProperty('on', false);

    await service.toggleAll();

    expect(status[0]).toHaveProperty('on', true);
    expect(status[1]).toHaveProperty('on', true);

    await service.toggleAll();
  });

  it('should be able to set the status for a single light', async () => {
    const status = await service.status(mockLights[1].name);

    expect(status).toHaveProperty('on', false);

    const response = await service.set(mockLights[1].name, true);

    expect(response).toBe(true);
    expect(status).toHaveProperty('on', true);

    await service.set(mockLights[1].name, false);
    expect(status).toHaveProperty('on', false);

    // Light not found
    expect(service.toggle('NonExistentLight')).rejects.toEqual(
      new NotFoundError('Light not found'),
    );
  });

  it('should be able to toggle the status for a single light', async () => {
    const status = await service.status(mockLights[1].name);

    expect(status).toHaveProperty('on', false);

    const response = await service.toggle(mockLights[1].name);

    expect(response).toBe(true);
    expect(status).toHaveProperty('on', true);

    await service.toggle(mockLights[1].name);
    expect(status).toHaveProperty('on', false);

    // Light not found
    expect(service.toggle('NonExistentLight')).rejects.toEqual(
      new NotFoundError('Light not found'),
    );
  });
});
