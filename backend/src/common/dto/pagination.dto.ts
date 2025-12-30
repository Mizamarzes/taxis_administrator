import { IsNumber, IsOptional, IsPositive, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class PaginationResponseDto<T> {
    items: T[];
    totalItems: number;
    currentPage: number;
    totalPages: number;
    previousPage: number | null;
    nextPage: number | null;

    constructor(partial: Partial<PaginationResponseDto<T>>) {
        Object.assign(this, partial);
    }
}

export class PaginationDTO {
    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    @Min(1)
    @IsOptional()
    @Transform(({ value }) => (value ? Number(value) : 1))
    page: number = 1;

    @Type(() => Number)
    @IsNumber()
    @IsPositive()
    @Min(1)
    @IsOptional()
    @Transform(({ value }) => (value ? Number(value) : 10))
    limit: number = 10;
}
