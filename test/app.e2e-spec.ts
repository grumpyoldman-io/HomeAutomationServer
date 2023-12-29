import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

import { mockLights } from '@mocks/lights';
import { MockHomeKitService, MockHueService } from '@mocks/services';

import { AppModule } from '../src/App.module';
import { HomeKitService } from '../src/HomeKit/HomeKit.service';
import { HueService } from '../src/Hue/Hue.service';

describe('Home Automation Server (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(HueService)
      .useValue(MockHueService)
      .overrideProvider(HomeKitService)
      .useValue(MockHomeKitService)
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
      .expect(mockLights);
  });

  it('/lights/toggle (GET)', () => {
    return request(app.getHttpServer())
      .get('/lights/toggle')
      .expect(200)
      .expect(mockLights);
  });

  it('/lights/store (GET)', () => {
    return request(app.getHttpServer())
      .get('/lights/store')
      .expect(200)
      .expect('');
  });

  it(`/lights/${mockLights[0].name} (GET)`, () => {
    return request(app.getHttpServer())
      .get(`/lights/${mockLights[0].name}`)
      .expect(200)
      .expect(mockLights[0]);
  });

  it('/lights/non-existing-light (GET)', () => {
    return request(app.getHttpServer())
      .get('/lights/non-existing-light')
      .expect(404)
      .expect({ status: 404, error: 'Light not found' });
  });

  it(`/lights/${mockLights[0].name}/toggle (GET)`, () => {
    return request(app.getHttpServer())
      .get(`/lights/${mockLights[0].name}/toggle`)
      .expect(200)
      .expect(mockLights[0].on ? 'false' : 'true');
  });

  it('/lights/non-existing-light/toggle (GET)', () => {
    return request(app.getHttpServer())
      .get('/lights/non-existing-light/toggle')
      .expect(404)
      .expect({ status: 404, error: 'Light not found' });
  });

  it(`/lights/${mockLights[0].name}/set/on (GET)`, () => {
    return request(app.getHttpServer())
      .get(`/lights/${mockLights[0].name}/set/on`)
      .expect(200)
      .expect('true');
  });

  it(`/lights/${mockLights[0].name}/set/off (GET)`, () => {
    return request(app.getHttpServer())
      .get(`/lights/${mockLights[0].name}/set/off`)
      .expect(200)
      .expect('false');
  });

  it('/lights/non-existing-light/set/on (GET)', () => {
    return request(app.getHttpServer())
      .get('/lights/non-existing-light/set/on')
      .expect(404)
      .expect({ status: 404, error: 'Light not found' });
  });
});
