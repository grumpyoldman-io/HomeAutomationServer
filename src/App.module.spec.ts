import { Test } from '@nestjs/testing';

import { AppController } from './App.controller';
import { AppModule } from './App.module';

describe('AppModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(module).toBeDefined();
    expect(module.get(AppController)).toBeInstanceOf(AppController);
  });
});
