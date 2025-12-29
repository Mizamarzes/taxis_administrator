import { ApiProperty } from '@nestjs/swagger';

export class RoleResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'ADMIN' })
    name: string;
}

export class UserResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'John Doe' })
    name: string;

    @ApiProperty({ example: 'john@example.com' })
    email: string;

    @ApiProperty({ type: [RoleResponseDto] })
    roles: RoleResponseDto[];

    @ApiProperty({ example: '2024-12-29T10:00:00Z' })
    createdAt: Date;

    @ApiProperty({ example: '2024-12-29T10:00:00Z' })
    updatedAt: Date;

    constructor(partial: Partial<UserResponseDto>) {
        Object.assign(this, partial);
    }
}
