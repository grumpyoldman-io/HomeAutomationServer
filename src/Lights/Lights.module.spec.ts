import { Test } from '@nestjs/testing';

import { MockHueService } from '@mocks/services';

import { HueService } from '../Hue/Hue.service';

import { LightsController } from './Lights.controller';
import { LightsModule } from './Lights.module';
import { LightsService } from './Lights.service';

describe('LightsModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [LightsModule],
    })
      .overrideProvider(HueService)
      .useValue(MockHueService)
      .compile();

    expect(module).toBeDefined();
    expect(module.get(LightsController)).toBeInstanceOf(LightsController);
    expect(module.get(LightsService)).toBeInstanceOf(LightsService);
  });
});
