import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { mockLights } from '@mocks/lights';
import { MockLightsService } from '@mocks/services';

import { LightsController } from './Lights.controller';
import { LightsService } from './Lights.service';

describe('LightsController', () => {
  let lightsController: LightsController;

  beforeEach(async () => {
    const Module: TestingModule = await Test.createTestingModule({
      providers: [LightsService],
      controllers: [LightsController],
    })
      .overrideProvider(LightsService)
      .useValue(MockLightsService)
      .compile();

    lightsController = Module.get<LightsController>(LightsController);
  });

  describe('/lights', () => {
    it('should return the status of all lights', () => {
      expect(lightsController.status()).resolves.toEqual({
        [mockLights[0].name]: mockLights[0],
        [mockLights[1].name]: mockLights[1],
      });
    });

    describe('/:name', () => {
      it('should return the status of a single light', () => {
        expect(lightsController.light(mockLights[0].name)).resolves.toEqual({
          [mockLights[0].name]: mockLights[0],
        });

        // Light not found
        expect(lightsController.light('NonExistentLight')).rejects.toEqual(
          new HttpException(
            {
              status: HttpStatus.NOT_FOUND,
              error: 'Light not found',
            },
            HttpStatus.NOT_FOUND,
          ),
        );
      });

      describe('/set', () => {
        it('should set a single light on/off', () => {
          expect(
            lightsController.lightSet(mockLights[0].name, 'on'),
          ).resolves.toEqual(true);

          expect(
            lightsController.lightSet(mockLights[0].name, 'off'),
          ).resolves.toEqual(false);

          // Light not found
          expect(
            lightsController.lightSet('NonExistentLight', 'off'),
          ).rejects.toEqual(
            new HttpException(
              {
                status: HttpStatus.NOT_FOUND,
                error: 'Light not found',
              },
              HttpStatus.NOT_FOUND,
            ),
          );
        });
      });

      describe('/toggle', () => {
        it('should toggle a single light on/off', () => {
          expect(
            lightsController.lightToggle(mockLights[0].name),
          ).resolves.toEqual(true);

          // Light not found
          expect(
            lightsController.lightToggle('NonExistentLight'),
          ).rejects.toEqual(
            new HttpException(
              {
                status: HttpStatus.NOT_FOUND,
                error: 'Light not found',
              },
              HttpStatus.NOT_FOUND,
            ),
          );
        });
      });
    });
  });
});
