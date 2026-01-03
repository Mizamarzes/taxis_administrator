import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { runSeeds } from './database/seeders';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import cookieParser from 'cookie-parser';

async function bootstrap() {
    // Create the NestJS application
    const app = await NestFactory.create(AppModule);

    // Global prefix
    app.setGlobalPrefix('api');

    // Global pipes
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    // Cookie parser middleware
    app.use(cookieParser());

    // CORS configuration
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3001',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // Global interceptors
    app.useGlobalInterceptors(new ResponseInterceptor());

    // Global filters
    app.useGlobalFilters(new HttpExceptionFilter());

    // Run seeds
    const dataSource = app.get(DataSource);
    await runSeeds(dataSource);

    // Swagger setup
    const config = new DocumentBuilder()
        .setTitle('Taxis administrator API')
        .setDescription('API documentation for Taxis administrator')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);

    // Start the application
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
