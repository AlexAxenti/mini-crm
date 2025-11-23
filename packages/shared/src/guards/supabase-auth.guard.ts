import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { AuthorizedRequest } from '../types/authorized-request';

interface SupabaseJwtPayload {
  sub: string; // user id
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthorizedRequest>();
    const token = request.headers['x-supabase-token'] as string;

    if (!token) {
      throw new UnauthorizedException('Supabase token is required');
    }

    try {
      const jwtSecret = process.env.SUPABASE_JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('SUPABASE_JWT_SECRET is not configured');
      }

      const decoded = jwt.verify(token, jwtSecret, {
        algorithms: ['HS256'],
      }) as SupabaseJwtPayload;

      if (!decoded.sub) {
        throw new UnauthorizedException('Invalid token: missing user ID');
      }

      request.userId = decoded.sub;

      return true;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid token');
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Token expired');
      }
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
