import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import {
  GlobalExceptionFilter,
  ApiKeyGuard,
  SupabaseAuthGuard,
} from '@mini-crm/shared';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties not in DTO
      forbidNonWhitelisted: true, // Throw error if extra properties
      transform: true, // Auto-transform payloads to DTO instances
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Apply auth guards globally
  app.useGlobalGuards(new ApiKeyGuard(), new SupabaseAuthGuard());

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
