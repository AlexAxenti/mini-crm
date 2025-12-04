import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ApiKeyGuard, SupabaseAuthGuard } from '@mini-crm/shared';

/**
 * Mock guards that bypass authentication but set userId from headers for testing
 */
export class MockApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // Always allow in test environment
    return true;
  }
}

export class MockSupabaseAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // Set userId from x-user-id header for tests
    if (request.headers['x-user-id']) {
      request.userId = request.headers['x-user-id'];
    }
    return true; // Always allow
  }
}

/**
 * Test configuration constants
 */
export const TEST_CONFIG = {
  // Test user ID - matches what's seeded in the database
  TEST_CONTACTS_USER_ID: '00000000-0000-0000-0000-000000000001',
  TEST_NOTES_USER_ID: '00000000-0000-0000-0000-000000000002',
  // Safe test API key (not a real production key)
  TEST_API_KEY: 'test-api-key-for-integration-tests-only',
};

/**
 * Standard mock auth headers for integration tests
 */
export const createMockAuthHeaders = (userId: string) => ({
  'x-user-id': userId,
  'api-key': TEST_CONFIG.TEST_API_KEY,
});

/**
 * Middleware to set userId from headers in test environment
 */
export class TestAuthMiddleware {
  use(req: any, res: any, next: () => void) {
    // Set userId from x-user-id header for tests
    if (req.headers && req.headers['x-user-id']) {
      req.userId = req.headers['x-user-id'];
    }
    next();
  }
}

/**
 * Mock Redis client for testing
 */
export class MockRedisClient {
  private cache: Map<string, any> = new Map();

  async get<T>(key: string): Promise<T | null> {
    return this.cache.get(key) || null;
  }

  async set(key: string, value: any, options?: { ex?: number }): Promise<void> {
    this.cache.set(key, value);
  }

  async del(...keys: string[]): Promise<void> {
    keys.forEach((key) => this.cache.delete(key));
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return Array.from(this.cache.keys()).filter((key) => regex.test(key));
  }

  // Helper method to clear all cache between tests
  clear(): void {
    this.cache.clear();
  }
}

/**
 * Setup function to override guards and add test middleware
 */
export const setupMockGuards = (moduleBuilder: any) => {
  return moduleBuilder
    .overrideGuard(ApiKeyGuard)
    .useClass(MockApiKeyGuard)
    .overrideGuard(SupabaseAuthGuard)
    .useClass(MockSupabaseAuthGuard)
    .overrideProvider('REDIS_CLIENT')
    .useClass(MockRedisClient);
};
