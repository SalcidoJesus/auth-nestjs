
import { applyDecorators, UseGuards } from '@nestjs/common';
import { ValidRoles } from '../interfaces';
import { RoleProtected } from './roleprotected/role-protected.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guards/user-role/user-role.guard';

export function Auth(...roles: ValidRoles[]) {
	return applyDecorators(

		RoleProtected(...roles),

		// UserRoleGuard es lo que nosotros hicimos
		// allí valido que el usuario tenga los roles que yo decida
		// los cuales son los del RoleProtected
		UseGuards(AuthGuard(), UserRoleGuard),

	);
}
