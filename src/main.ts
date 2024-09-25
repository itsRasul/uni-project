import { OrderItem } from 'src/order/entities/orderItems.entity';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import * as cookieParser from 'cookie-parser';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { setupSwagger } from './common/utilities/swagger';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const corsOptions: CorsOptions = {
    origin: ['http://localhost:3000'],
    methods: 'GET,PATCH,POST,DELETE',
    credentials: true
  };

  app.enableCors(corsOptions);

  app.use(cookieParser());

  app.use(morgan('combined'));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.useStaticAssets(join(__dirname, '..', 'public'));

  setupSwagger(app);

  await app.listen(5000);
}
bootstrap();
