import { User } from '../entities/user.entity';
import { UserResponseDto } from '../dto/user-response.dto';

/**
 * Mapea una entidad User a UserResponseDto
 * Excluye campos sensibles como password
 */
export const mapUserToUserResponseDto = (user: User): UserResponseDto => {
    return new UserResponseDto({
        id: user.id,
        name: user.name,
        email: user.email,
        roles:
            user.userRoles?.map((ur) => ({
                id: ur.role.id,
                name: ur.role.name,
            })) || [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    });
};

/**
 * Mapea un array de Users a UserResponseDto[]
 */
export const mapUsersToUserResponseDtos = (users: User[]): UserResponseDto[] => {
    return users.map((user) => mapUserToUserResponseDto(user));
};
