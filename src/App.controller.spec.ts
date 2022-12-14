import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './App.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return a string', () => {
      expect(appController.redirect()).toBe(
        'Redirects to the Github repository of this project',
      );
    });
  });
});
