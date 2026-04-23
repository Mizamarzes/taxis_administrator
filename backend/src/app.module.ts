import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { config } from './config/config';
import { DriversModule } from './drivers/drivers.module';
import { DriversModule } from './drivers/drivers.module';
import { DriversModule } from './drivers/drivers.module';
import { DriversModule } from './drivers/drivers.module';
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            cache: true,
            load: [config],
        }),
        TypeOrmModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('database.host'),
                port: configService.get<number>('database.port'),
                username: configService.get('database.username'),
                password: configService.get('database.password'),
                database: configService.get('database.database'),
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: configService.get('app.nodeEnv') === 'development',
            }),
            inject: [ConfigService],
        }),
        UsersModule,
        AuthModule,
        RolesModule,
        PermissionsModule,
        DriversModule,
    ],
})
export class AppModule {}
