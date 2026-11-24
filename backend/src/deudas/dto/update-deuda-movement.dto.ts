import { PartialType } from '@nestjs/swagger';
import { CreateDeudaMovementDto } from './create-deuda-movement.dto';

export class UpdateDeudaMovementDto extends PartialType(CreateDeudaMovementDto) {}
