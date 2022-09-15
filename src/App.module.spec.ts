import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';

import { AppController } from './App.controller';
import { AppModule } from './App.module';
import { HomeKitModule } from './HomeKit/HomeKit.module';
import { LightsModule } from './Lights/Lights.module';

describe('AppModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(module).toBeDefined();
    expect(module.get(LightsModule)).toBeInstanceOf(LightsModule);
    expect(module.get(HomeKitModule)).toBeInstanceOf(HomeKitModule);
    expect(module.get(AppController)).toBeInstanceOf(AppController);
  });

  it('should announce the port it will run on', () => {
    const mockLogger = { log: jest.fn() } as unknown as Logger;
    const module = new AppModule(new ConfigService(), mockLogger);
    module.onApplicationBootstrap();

    expect(mockLogger.log).toHaveBeenNthCalledWith(
      1,
      `Server starting on http://localhost:${AppModule.port}`,
    );
  });
});
