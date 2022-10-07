import { SetMetadata } from '@nestjs/common';
import { DecoratorKey } from '~/config/constants';

export const RoutePublic = () => SetMetadata(DecoratorKey.ROUTE_PUBLIC, true);
