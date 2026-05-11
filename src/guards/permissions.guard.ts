import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PERMS_KEY } from '../decorators/permissions.decorator';
import { ROLE_PERMISSIONS } from '../common/RBAC/role-permission';

type Role = keyof typeof ROLE_PERMISSIONS;

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMS_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (!required) return true;

    const gqlCtx = GqlExecutionContext.create(ctx);
    const user = gqlCtx.getContext().req?.user;

    if (!user?.role) return false;

    const role = user.role as Role;

    if (!(role in ROLE_PERMISSIONS)) return false;

    const perms: string[] = Array.from(ROLE_PERMISSIONS[role]);

    if (perms.includes('*')) return true;

    return required.every((p) => perms.includes(p));
  }
}
