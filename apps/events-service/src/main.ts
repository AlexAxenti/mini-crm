import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import {
  ApiKeyGuard,
  GlobalExceptionFilter,
  SupabaseAuthGuard,
} from '@mini-crm/shared';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Apply auth guards globally
  app.useGlobalGuards(new ApiKeyGuard(), new SupabaseAuthGuard());

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
