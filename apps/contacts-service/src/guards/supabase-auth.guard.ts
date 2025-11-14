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

    console.log('token', token);

    if (!token) {
      throw new UnauthorizedException('Supabase token is required');
    }

    try {
      // Get Supabase JWT secret from environment
      const jwtSecret = process.env.SUPABASE_JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('SUPABASE_JWT_SECRET is not configured');
      }

      console.log('jwtSecret', jwtSecret);

      // Verify and decode the JWT
      const decoded = jwt.verify(token, jwtSecret, {
        algorithms: ['HS256'],
      }) as SupabaseJwtPayload;

      // Extract user ID from the 'sub' claim
      if (!decoded.sub) {
        throw new UnauthorizedException('Invalid token: missing user ID');
      }

      // Attach userId to request for downstream use
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
