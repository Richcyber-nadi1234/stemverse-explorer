
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend access
  app.enableCors({
    origin: [
      'http://localhost:5173', // Local Development
      'http://localhost:4173', // Local Preview
      process.env.FRONTEND_URL // Production URL from Env
    ].filter((origin): origin is string => !!origin),
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  // Global Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`STEMverse Backend is running on port: ${port}`);
}
bootstrap();
