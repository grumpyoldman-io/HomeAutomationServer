import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import { HueModule } from './Hue.module';
import { HueService } from './Hue.service';

describe('HueModule', () => {
  it('should compile the module', async () => {
    process.env.HUE_HOST = 'HUE-HOST';
    process.env.HUE_USER = 'HUE-USER';

    const module = await Test.createTestingModule({
      imports: [HueModule],
    }).compile();

    expect(module).toBeDefined();
    expect(module.get(ConfigService)).toBeInstanceOf(ConfigService);
    expect(module.get(HueService)).toBeInstanceOf(HueService);
  });
});
