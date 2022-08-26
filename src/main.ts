import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './App.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.getHttpAdapter().getInstance().disable('x-powered-by');

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder()
      .setTitle('Home Automation Server')
      .setDescription(
        'A simple home automation server that allows you to toggle Philips Hue lights via REST calls',
      )
      .setVersion(process.env.npm_package_version ?? 'N.A.')
      .build(),
  );
  SwaggerModule.setup('docs', app, document);

  await app.listen(AppModule.port);
}
bootstrap();
