import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // const user = request.user;
    // const dbUser = await this.userService.findById(user.userId);
    //
    // if (!dbUser || !dbUser.isAdmin) {
    //   throw new ForbiddenException();
    // }

    if (!user || !user.isAdmin) {
      throw new ForbiddenException('Admin resource. Access denied.');
    }

    return true;
  }
}
