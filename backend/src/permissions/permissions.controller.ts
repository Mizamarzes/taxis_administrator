import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Can } from '../authorization/can.decorator';
import type { ApiResponseInterface } from '../common/interfaces/api-response.interface';
import type { PermissionGroup } from './permissions.catalog';
import { PermissionsService } from './permissions.service';

@ApiTags('permissions')
@Controller('permissions')
export class PermissionsController {
    constructor(private readonly permissionsService: PermissionsService) {}

    @Get('get-all')
    @Can('roles.read')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get the permission catalog grouped by resource' })
    findAll(): ApiResponseInterface<PermissionGroup[]> {
        return {
            message: 'Permissions retrieved successfully',
            data: this.permissionsService.findAll(),
        };
    }
}
