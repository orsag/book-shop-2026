import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class UserOwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const authenticatedUserId = request.user?.userId;
    const targetUserId = request.params.userId; // Triggers on ':userId' routes

    // 💡 THE TRICK: If the route doesn't have a ':userId' parameter,
    // we assume ownership validation isn't needed for this endpoint.
    if (!targetUserId) {
      return true;
    }

    // If there IS a userId param, but it doesn't match the token, block it
    if (!authenticatedUserId || authenticatedUserId !== targetUserId) {
      throw new UnauthorizedException('You can only access your own data.');
    }

    return true;
  }
}
