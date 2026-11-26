import { BadRequestException, ConflictException } from '@nestjs/common';
import type { DataSource, Repository } from 'typeorm';
import type { AuthorizationService } from '../authorization/authorization.service';
import type { User } from '../users/entities/user.entity';
import type { Role } from './entities/role.entity';
import type { RolePermission } from './entities/rolePermission.entity';
import { RolesService } from './roles.service';

const makeRole = (overrides: Partial<Role>): Role =>
    ({ id: 10, name: 'CONTADOR', description: null, isSystem: false, ...overrides }) as Role;

describe('RolesService', () => {
    let roleRepository: { findOne: jest.Mock; delete: jest.Mock };
    let userRepository: { count: jest.Mock };
    let dataSource: { transaction: jest.Mock };
    let authorization: { invalidateRole: jest.Mock };
    let service: RolesService;

    beforeEach(() => {
        roleRepository = { findOne: jest.fn(), delete: jest.fn() };
        userRepository = { count: jest.fn().mockResolvedValue(0) };
        dataSource = { transaction: jest.fn() };
        authorization = { invalidateRole: jest.fn() };
        service = new RolesService(
            roleRepository as unknown as Repository<Role>,
            {} as Repository<RolePermission>,
            userRepository as unknown as Repository<User>,
            dataSource as unknown as DataSource,
            authorization as unknown as AuthorizationService,
        );
    });

    it('no elimina roles del sistema', async () => {
        roleRepository.findOne.mockResolvedValue(makeRole({ name: 'ADMIN', isSystem: true }));
        await expect(service.remove(10)).rejects.toBeInstanceOf(BadRequestException);
        expect(roleRepository.delete).not.toHaveBeenCalled();
    });

    it('no elimina un rol con usuarios, contando los eliminados', async () => {
        roleRepository.findOne.mockResolvedValue(makeRole({}));
        userRepository.count.mockResolvedValue(2);
        await expect(service.remove(10)).rejects.toBeInstanceOf(ConflictException);
        expect(userRepository.count).toHaveBeenCalledWith({
            where: { roleId: 10 },
            withDeleted: true,
        });
    });

    it('elimina un rol propio sin usuarios e invalida el cache', async () => {
        roleRepository.findOne.mockResolvedValue(makeRole({}));
        await service.remove(10);
        expect(roleRepository.delete).toHaveBeenCalledWith(10);
        expect(authorization.invalidateRole).toHaveBeenCalledWith(10);
    });

    it('no permite editar los permisos de SUPERADMIN', async () => {
        roleRepository.findOne.mockResolvedValue(makeRole({ name: 'SUPERADMIN', isSystem: true }));
        await expect(
            service.updatePermissions(10, { actions: [] }, { sub: 1, email: 'a@b.co', roleId: 1 }),
        ).rejects.toBeInstanceOf(BadRequestException);
        expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('no deja que un rol se quite a sí mismo roles.update', async () => {
        roleRepository.findOne.mockResolvedValue(makeRole({}));
        await expect(
            service.updatePermissions(
                10,
                { actions: ['roles.read'] },
                { sub: 1, email: 'a@b.co', roleId: 10 },
            ),
        ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('no renombra roles del sistema', async () => {
        roleRepository.findOne.mockResolvedValue(makeRole({ name: 'ADMIN', isSystem: true }));
        await expect(service.update(10, { name: 'JEFE' })).rejects.toBeInstanceOf(
            BadRequestException,
        );
    });
});
