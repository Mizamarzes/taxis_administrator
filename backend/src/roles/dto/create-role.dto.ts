import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateRoleDto {
    @Transform(({ value }: { value: string }) => value?.trim().toUpperCase())
    @IsString()
    @Matches(/^[A-Z][A-Z0-9_]{1,49}$/, {
        message: 'Name must be 2-50 characters: letters, numbers or underscore',
    })
    name: string;

    @IsOptional()
    @Transform(({ value }: { value: string }) => value?.trim())
    @IsString()
    @MaxLength(255)
    description?: string;
}
