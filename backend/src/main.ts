import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Puerto configurable via variable de entorno o por defecto 3000
  await app.listen(process.env.PORT ?? 3000);

  // Prefijo global para las rutas de la API
  app.setGlobalPrefix('api');

}
bootstrap();
