import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['log', 'warn', 'error'] });
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`\n  Application running on http://localhost:${port}`);
  console.log(`  Login page:    http://localhost:${port}/`);
  console.log(`  API endpoints: http://localhost:${port}/api/auth/\n`);
}

bootstrap();
