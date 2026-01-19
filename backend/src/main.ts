import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { runSeeds } from './config/database/seeders';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
    // Create the NestJS application
    const app = await NestFactory.create(AppModule);

    // Obtener ConfigService
    const configService = app.get(ConfigService);

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
    app.use(cookieParser(configService.get('cookies.secret')));

    // CORS configuration
    app.enableCors({
        origin: configService.get<string>('frontend.url') || 'http://localhost:5173',
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
    const port = configService.get<number>('server.port') || 3000;
    await app.listen(port);

    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`📚 Swagger docs: http://localhost:${port}/docs`);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
