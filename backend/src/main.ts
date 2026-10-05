import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for all clients (Mobile app, Web app, etc.)
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global API prefix: api/v1
  app.setGlobalPrefix('api/v1', {
    exclude: ['health', ''],
  });

  // Backward compatibility middleware: route /api/* requests (without /v1) to /api/v1/*
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use((req: any, _res: any, next: any) => {
    if (req.url && req.url.startsWith('/api/') && !req.url.startsWith('/api/v1/')) {
      req.url = req.url.replace('/api/', '/api/v1/');
    }
    next();
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🏟️  TurfTown Backend running on http://localhost:${port}/api/v1`);
}
bootstrap();
