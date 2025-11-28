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
  TEST_USER_ID: '00000000-0000-0000-0000-000000000001',
  // Safe test API key (not a real production key)
  TEST_API_KEY: 'test-api-key-for-integration-tests-only',
};

/**
 * Standard mock auth headers for integration tests
 */
export const createMockAuthHeaders = (userId?: string) => ({
  'x-user-id': userId || TEST_CONFIG.TEST_USER_ID,
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
 * Setup function to override guards and add test middleware
 */
export const setupMockGuards = (moduleBuilder: any) => {
  return moduleBuilder
    .overrideGuard(ApiKeyGuard)
    .useClass(MockApiKeyGuard)
    .overrideGuard(SupabaseAuthGuard)
    .useClass(MockSupabaseAuthGuard);
};
