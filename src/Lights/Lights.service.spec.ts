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
    const status = await service.status();

    mockLights.forEach((mockLight) => {
      expect(status).toHaveProperty(mockLight.name);
      expect(status[mockLight.name]).toMatchObject(mockLight);
    });
  });

  it('should be able to fetch the status for a single light', async () => {
    const status = await service.status(mockLights[1].name);
    expect(status).toHaveProperty(mockLights[1].name);
    expect(status[mockLights[1].name]).toMatchObject(mockLights[1]);

    // Light not found
    expect(service.status('NonExistentLight')).rejects.toEqual(
      new NotFoundError('Light not found'),
    );
  });

  it('should be able to toggle the status for a single light', async () => {
    const status = await service.status(mockLights[1].name);

    expect(status[mockLights[1].name]).toHaveProperty('on', false);

    const response = await service.toggle(mockLights[1].name);

    expect(response).toBe('ok');
    expect(status[mockLights[1].name]).toHaveProperty('on', true);

    await service.toggle(mockLights[1].name);
    expect(status[mockLights[1].name]).toHaveProperty('on', false);

    // Light not found
    expect(service.toggle('NonExistentLight')).rejects.toEqual(
      new NotFoundError('Light not found'),
    );
  });
});
