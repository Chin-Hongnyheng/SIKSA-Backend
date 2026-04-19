import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMS_KEY } from "../decorators/permissions.decorator";
import { ROLE_PERMISSIONS } from "../common/RBAC/role-permission";

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(ctx: ExecutionContext): boolean {
        const required = this.reflector.getAllAndOverride<string[]>(PERMS_KEY, [
            ctx.getHandler(),
            ctx.getClass(),
        ]);
        if (!required) return true;

        const req = ctx.switchToHttp().getRequest();
        const perms: string[] = ROLE_PERMISSIONS[req.user.role] || [];
        return required.every((p) => perms.includes(p));
    }
}