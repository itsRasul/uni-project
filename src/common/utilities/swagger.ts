import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const setupSwagger = (app: NestExpressApplication) => {
  const options = new DocumentBuilder()
    .setTitle('event-project-documentation')
    // .setDescription('Description of your API')
    .setVersion('1.0.0')
    .addTag('event-project-documentation') // Optional: Add tags for organization
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);
};
