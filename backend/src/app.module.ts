import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: '127.0.0.1',
            port: 5433,
            username: 'user_crud',
            password: 'root',
            database: 'db_crud',
            autoLoadEntities: true,
            synchronize: true,
        }),
        UsersModule,
        AuthModule,
        RolesModule,
        PermissionsModule,
    ],
})
export class AppModule {}
