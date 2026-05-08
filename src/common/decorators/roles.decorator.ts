import { SetMetadata } from '@nestjs/common';
import { ROLE_ENUM } from '../constants/constants';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
