import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HueService } from '../src/hue.service';

const mockLights = [{ id: '1', name: 'mock-light-1', on: false }];
const mockHueService = {
  getAllLights: () => mockLights,
  getLight: (name: string) => {
    const light = mockLights.find((light) => light.name === name);
    if (light === undefined) {
      throw new Error('Light not found');
    }
    return light;
  },
  toggleLight: (name: string) => {
    const light = mockLights.find((light) => light.name === name);
    if (light === undefined) {
      throw new Error('Light not found');
    }
    return 'ok';
  },
};

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(HueService)
      .useValue(mockHueService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(302)
      .expect((res) =>
        expect(res.headers['location']).toBe(
          'https://github.com/grumpyoldman-io/HomeAutomationServer',
        ),
      );
  });

  it('/lights (GET)', () => {
    return request(app.getHttpServer())
      .get('/lights')
      .expect(200)
      .expect({ 'mock-light-1': { id: '1', name: 'mock-light-1', on: false } });
  });

  it('/lights/mock-light-1 (GET)', () => {
    return request(app.getHttpServer())
      .get('/lights/mock-light-1')
      .expect(200)
      .expect({ 'mock-light-1': { id: '1', name: 'mock-light-1', on: false } });
  });

  it('/lights/non-existing-light (GET)', () => {
    return request(app.getHttpServer())
      .get('/lights/non-existing-light')
      .expect(404)
      .expect({ status: 404, error: 'Light not found' });
  });

  it('/lights/mock-light-1/toggle (GET)', () => {
    return request(app.getHttpServer())
      .get('/lights/mock-light-1/toggle')
      .expect(200)
      .expect('ok');
  });

  it('/lights/non-existing-light/toggle (GET)', () => {
    return request(app.getHttpServer())
      .get('/lights/non-existing-light/toggle')
      .expect(404)
      .expect({ status: 404, error: 'Light not found' });
  });
});
