# NeuralLog Auth SDK

This SDK provides authentication and authorization functionality for the NeuralLog web application. It uses the auth service API and respects the tenant context from the tenant service.

## Overview

The auth SDK provides:

1. **Permission Management**: Check, grant, and revoke permissions
2. **Tenant Management**: Create, delete, and list tenants
3. **User Management**: Add, remove, and update users in tenants
4. **React Integration**: Components and hooks for easy integration with React applications

## Usage

### Basic Usage

```typescript
import { AuthClient, Permission, ResourceType } from '@/sdk/auth';

// Create a client
const client = new AuthClient({
  apiUrl: 'http://localhost:3040',
  apiKey: 'your-api-key',
});

// Initialize the client
await client.initialize();

// Check if a user has permission to access a resource
const hasPermission = await client.check(
  'user_123',
  Permission.READ,
  ResourceType.LOG,
  'system-logs'
);

// Grant a permission to a user
await client.grant(
  'user_123',
  Permission.READ,
  ResourceType.LOG,
  'system-logs'
);

// Revoke a permission from a user
await client.revoke(
  'user_123',
  Permission.READ,
  ResourceType.LOG,
  'system-logs'
);
```

### React Integration

```tsx
import { useAuth, Permission, ResourceType, PermissionGuard } from '@/sdk/auth';

// Use the auth context
function MyComponent() {
  const { checkPermission } = useAuth();

  const handleCheckPermission = async () => {
    const hasPermission = await checkPermission(
      'user_123',
      Permission.READ,
      ResourceType.LOG,
      'system-logs'
    );

    console.log('Has permission:', hasPermission);
  };

  return (
    <div>
      <button onClick={handleCheckPermission}>Check Permission</button>

      <PermissionGuard
        permission={Permission.READ}
        resourceType={ResourceType.LOG}
        resourceId="system-logs"
        fallback={<div>You don't have permission to view this content.</div>}
      >
        <div>This content is only visible to users with the READ permission.</div>
      </PermissionGuard>
    </div>
  );
}
```

## Configuration

The auth SDK can be configured with the following options:

```typescript
interface AuthClientOptions {
  /**
   * Auth service API URL
   * @default http://localhost:3040
   */
  apiUrl?: string;

  /**
   * API key for auth service
   */
  apiKey?: string;

  /**
   * Cache TTL in milliseconds
   * @default 300000 (5 minutes)
   */
  cacheTtl?: number;
}
```

## Environment Variables

The auth SDK uses the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_AUTH_SERVICE_API_URL` | Auth service API URL | `http://localhost:3040` |
| `NEXT_PUBLIC_AUTH_SERVICE_API_KEY` | API key for auth service | - |
| `NEXT_PUBLIC_AUTH_CACHE_TTL` | Cache TTL in milliseconds | `300000` |

## Deployment Architecture

The auth SDK works with a single auth service instance that serves all tenants. The tenant ID is passed to the auth service to scope operations, ensuring proper isolation between tenants.

```typescript
const client = new AuthClient({
  apiUrl: 'http://localhost:3040',
  apiKey: 'your-api-key',
});
```

## Tenant Context

The auth SDK respects the tenant context from the tenant service. It automatically gets the tenant ID from the tenant service and uses it for all operations.

The tenant ID is used to scope operations to a specific tenant. All authorization checks are performed within the context of the current tenant.

## Caching

The auth SDK includes a caching layer to improve performance. Permission checks are cached for 5 minutes by default. You can customize the cache TTL using the `cacheTtl` option.

## Error Handling

The auth SDK includes error handling for all operations. If an operation fails, it will return `false` or an empty array, depending on the operation.

## API Reference

See the [API Reference](./API.md) for a complete list of methods and parameters.
