import { SetMetadata } from '@nestjs/common';
import { DecoratorKey } from '~/config/constants';
import { UserRole } from '~/modules/user/types';

export const ApplyRoles = (...roles: UserRole[]) =>
    SetMetadata(DecoratorKey.USER_ROLE, roles);
