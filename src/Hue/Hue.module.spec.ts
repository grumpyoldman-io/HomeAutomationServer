import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import { ENV_PATHS } from '../Constants';

import { HueModule } from './Hue.module';
import { HueService } from './Hue.service';

describe('HueModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: ENV_PATHS,
        }),
        HueModule,
      ],
    }).compile();

    expect(module).toBeDefined();
    expect(module.get(ConfigService)).toBeInstanceOf(ConfigService);
    expect(module.get(HueService)).toBeInstanceOf(HueService);
  });
});
