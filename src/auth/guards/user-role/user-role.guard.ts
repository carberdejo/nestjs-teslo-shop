import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { META_ROLES } from 'src/auth/decorators/role-protected.decorator';
import { User } from 'src/auth/entities/user.entity';
import { ValidRoles } from 'src/auth/interfaces/valid-roles';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.get<ValidRoles[]>(
      META_ROLES,
      context.getHandler(),
    );

    // Si no hay roles requeridos, deja pasar
    if (!requiredRoles) return true;
    //Si el arreglo de roles está vacío, deja pasar
    if (requiredRoles.length === 0) return true;

    // Obtén el usuario del request
    const req = context.switchToHttp().getRequest<Express.Request>();
    const user = req.user as User;

    // Verifica si el usuario tiene alguno de los roles requeridos
    if (!user) throw new BadRequestException('User not found in request');

    console.log(user.roles);

    for (const role of requiredRoles) {
      if (user.roles.includes(role)) {
        return true;
      }
    }

    throw new ForbiddenException(
      'user does not have the required roles: ' + requiredRoles.join(', '),
    );
  }
}
