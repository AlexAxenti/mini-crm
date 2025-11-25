import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class CommKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const commKey = request.headers['x-comm-key'] as string | undefined;

    if (!commKey) {
      throw new UnauthorizedException('Communication key required');
    }

    if (commKey !== process.env.EVENTS_COMM_KEY) {
      throw new UnauthorizedException('Invalid communication key');
    }

    return true;
  }
}
