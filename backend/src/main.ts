
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { exec } from 'child_process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for all origins to ensure frontend connectivity in various environments
  app.enableCors({
    origin: true, 
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Optional: auto-run Prisma seed on startup when AUTO_SEED is enabled
  const autoSeed = String(process.env.AUTO_SEED || '').toLowerCase();
  if (autoSeed === 'true' || autoSeed === '1') {
    console.log('AUTO_SEED enabled: running database seed...');
    try {
      await new Promise<void>((resolve, reject) => {
        exec('npm run seed', { cwd: process.cwd() }, (error, stdout, stderr) => {
          if (error) {
            console.error('AUTO_SEED failed:', stderr || error.message);
            reject(error);
            return;
          }
          if (stdout) console.log(stdout.trim());
          console.log('AUTO_SEED completed');
          resolve();
        });
      });
    } catch (e) {
      // Continue boot even if seeding fails
      console.error('AUTO_SEED encountered an error but boot will continue.', e);
    }
  }

  const port = process.env.PORT || 3300;
  await app.listen(port);
  console.log(`STEMverse Backend is running on port: ${port}`);
}
bootstrap();
