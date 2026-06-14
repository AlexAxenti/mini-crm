import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify, errors as joseErrors } from 'jose';
import { AuthorizedRequest } from '../types/authorized-request';

interface SupabaseJwtPayload {
  sub: string; // user id
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getSupabaseUrl(): string {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL is not configured');
  }

  return supabaseUrl.replace(/\/$/, '');
}

function getJwks() {
  if (!jwks) {
    jwks = createRemoteJWKSet(
      new URL(`${getSupabaseUrl()}/auth/v1/.well-known/jwks.json`),
    );
  }

  return jwks;
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthorizedRequest>();
    const token = request.headers['x-supabase-token'] as string;

    if (!token) {
      throw new UnauthorizedException('Supabase token is required');
    }

    try {
      const { payload: decoded } = await jwtVerify(token, getJwks(), {
        issuer: `${getSupabaseUrl()}/auth/v1`,
      });

      if (!decoded.sub) {
        throw new UnauthorizedException('Invalid token: missing user ID');
      }

      request.userId = decoded.sub as SupabaseJwtPayload['sub'];

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      if (error instanceof joseErrors.JWTExpired) {
        throw new UnauthorizedException('Token expired');
      }
      if (error instanceof joseErrors.JOSEError) {
        throw new UnauthorizedException('Invalid token');
      }
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
