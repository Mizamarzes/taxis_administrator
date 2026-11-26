import { ApiProperty } from '@nestjs/swagger';

export class RoleResponseDto {
    @ApiProperty({ example: 2 })
    id: number;

    @ApiProperty({ example: 'ADMIN' })
    name: string;

    @ApiProperty({ example: 'Administrator with management access', nullable: true })
    description: string | null;

    @ApiProperty({ example: true })
    isSystem: boolean;

    @ApiProperty({ example: false })
    isSuperAdmin: boolean;

    @ApiProperty({ example: 3 })
    userCount: number;

    @ApiProperty({ example: 30 })
    permissionCount: number;
}

export class RoleDetailResponseDto extends RoleResponseDto {
    @ApiProperty({ example: ['drivers.read', 'drivers.create'] })
    permissions: string[];
}
