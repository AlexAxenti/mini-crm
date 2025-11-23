# @mini-crm/shared

Shared utilities, guards, and types for mini-crm microservices.

## Structure

```
src/
├── guards/
│   ├── api-key.guard.ts          # API key validation guard
│   └── supabase-auth.guard.ts    # Supabase JWT authentication guard
├── types/
│   └── authorized-request.ts     # Extended Express Request with userId
└── utils/
    ├── parse-uuid-param.ts       # UUID parameter decorator
    └── global-exception-filter.ts # Global exception handling filter
```

## Usage

Install in your service:

```json
{
  "dependencies": {
    "@mini-crm/shared": "*"
  }
}
```

Import what you need:

```typescript
import { 
  ApiKeyGuard, 
  SupabaseAuthGuard, 
  AuthorizedRequest,
  UuidParam,
  GlobalExceptionFilter 
} from '@mini-crm/shared';
```

## Building

```bash
npm run build
```

This compiles TypeScript to the `dist/` directory with type definitions.

## Development

After making changes to the shared package:

1. Rebuild: `npm run build`
2. Changes will automatically be available to services via npm workspaces
