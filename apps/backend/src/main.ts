import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const port = process.env['PORT'] !== undefined ? parseInt(process.env['PORT'], 10) : 3000;
  await app.listen(port);
}

void bootstrap();
