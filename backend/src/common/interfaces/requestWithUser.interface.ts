import { Role } from '../enums/rol.enum';

export interface RequestWithUserInterface {
    email: string;
    roles: Role[];
}
