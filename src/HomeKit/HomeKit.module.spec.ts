import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import { MockHueService } from '@mocks/services';

import { ENV_PATHS } from '../Constants';
import { HueService } from '../Hue/Hue.service';

import { HomeKitModule } from './HomeKit.module';
import { HomeKitService } from './HomeKit.service';

describe('HomeKitModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: ENV_PATHS,
        }),
        HomeKitModule,
      ],
    })
      .overrideProvider(HueService)
      .useValue(MockHueService)
      .compile();

    expect(module).toBeDefined();
    expect(module.get(HomeKitService)).toBeInstanceOf(HomeKitService);
  });
});
