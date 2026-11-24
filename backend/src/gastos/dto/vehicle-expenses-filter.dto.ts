import { IsDateString, IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDTO } from '../../common/dto/pagination.dto';
import { ExpenseCategory } from '../enums/expense-category.enum';

export class VehicleExpensesFilterDto extends PaginationDTO {
    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    vehicleId?: number;

    @ApiPropertyOptional({ enum: ExpenseCategory })
    @IsOptional()
    @IsEnum(ExpenseCategory)
    category?: ExpenseCategory;

    @ApiPropertyOptional({ example: '2026-01-01' })
    @IsOptional()
    @IsDateString()
    expenseDateFrom?: string;

    @ApiPropertyOptional({ example: '2026-12-31' })
    @IsOptional()
    @IsDateString()
    expenseDateTo?: string;
}
