# Tenant Migration in NeuralLog

This document provides a detailed guide on tenant migration in NeuralLog, focusing on how the OpenFGA parent-child relationship model facilitates seamless migration between Kubernetes namespaces.

## Overview

In a multi-tenant environment with Kubernetes, tenants may need to be migrated between namespaces for various reasons:

- Resource optimization
- Geographical distribution
- Compliance requirements
- Tenant isolation
- Performance tuning

The parent-child relationship model in OpenFGA makes this migration process significantly easier compared to other approaches.

## Authorization Model

Our authorization model defines explicit relationships between tenants, users, and API keys:

```typescript
// Tenant type with admin and member relations
{
  type: 'tenant',
  relations: {
    admin: { this: {} },
    member: { this: {} }
  }
}

// API key type with parent relationship to tenant
{
  type: 'api_key',
  relations: {
    owner: { this: {} },
    parent: { this: {} },
    can_use: { /* ... */ }
  },
  metadata: {
    relations: {
      parent: {
        directly_related_user_types: [
          { type: 'tenant' }
        ]
      }
    }
  }
}
```

## How Parent-Child Relationships Enable Easy Migration

The parent-child relationship model offers several advantages for tenant migration:

1. **Centralized Tenant Identity**: The tenant is a distinct object with its own identity
2. **Explicit Relationships**: All relationships are explicitly defined
3. **Hierarchical Structure**: Resources belong to tenants through parent relationships
4. **Single Point of Update**: Migrating a tenant only requires updating the tenant object

## Migration Process

### Step 1: Create the New Tenant

```typescript
// Create a new tenant with the new namespace ID
await createTenant(newTenantId, adminUserId);
```

### Step 2: Find and Copy User Relationships

```typescript
// Find all users with access to the old tenant
const users = await getUsersInTenant(oldTenantId);

// Copy all user relationships to the new tenant
for (const user of users) {
  const isAdmin = await isUserTenantAdmin(oldTenantId, user.id);
  await addUserToTenant(newTenantId, user.id, isAdmin);
}
```

### Step 3: Update API Key Parent Relationships

```typescript
// Find all API keys belonging to the old tenant
const apiKeys = await getTenantApiKeys(oldTenantId);

// Update the parent relationship for all API keys
for (const apiKeyId of apiKeys) {
  await fgaClient.write({
    writes: [
      {
        user: `tenant:${newTenantId}`,
        relation: 'parent',
        object: `api_key:${apiKeyId}`,
      },
    ],
    deletes: [
      {
        user: `tenant:${oldTenantId}`,
        relation: 'parent',
        object: `api_key:${apiKeyId}`,
      },
    ],
  });
}
```

### Step 4: Verify the Migration

```typescript
// Verify that all users have access to the new tenant
for (const user of users) {
  const hasAccess = await isUserInTenant(newTenantId, user.id);
  if (!hasAccess) {
    throw new Error(`User ${user.id} does not have access to the new tenant`);
  }
}

// Verify that all API keys belong to the new tenant
for (const apiKeyId of apiKeys) {
  const belongsToTenant = await apiKeyBelongsToTenant(apiKeyId, newTenantId);
  if (!belongsToTenant) {
    throw new Error(`API key ${apiKeyId} does not belong to the new tenant`);
  }
}
```

## Integration with Kubernetes

The tenant migration process integrates seamlessly with Kubernetes:

### 1. Kubernetes Namespace Creation

```bash
kubectl create namespace ${NEW_TENANT_ID}
```

### 2. Service Deployment

```bash
# Deploy services to the new namespace
kubectl apply -f services.yaml -n ${NEW_TENANT_ID}
```

### 3. Data Migration

```bash
# Migrate databases and storage
kubectl exec -n ${OLD_TENANT_ID} migration-job -- ./migrate-data.sh ${NEW_TENANT_ID}

# Update authorization relationships
kubectl exec -n ${NEW_TENANT_ID} auth-job -- ./migrate-tenant.js ${OLD_TENANT_ID} ${NEW_TENANT_ID}
```

### 4. DNS/Routing Update

```bash
# Update ingress rules
kubectl apply -f ingress-update.yaml
```

### 5. Verification and Cleanup

```bash
# Verify the new namespace
kubectl exec -n ${NEW_TENANT_ID} verification-job -- ./verify.sh

# Remove the old namespace
kubectl delete namespace ${OLD_TENANT_ID}
```

## Advantages Over Other Approaches

### Compared to Simple Namespacing

With simple namespacing (e.g., `tenant:${tenantId}:api_key:${keyId}`):

- Migration requires updating every individual resource
- No explicit tenant object to manage
- Higher risk of errors during migration

### Compared to Contextual Tuples

With contextual tuples:

- Context is not part of the object identity
- Migration requires updating all tuples with the new context
- No hierarchical structure to leverage

## Best Practices

1. **Plan Migrations Carefully**: Document all steps and create a rollback plan
2. **Perform in Maintenance Windows**: Schedule migrations during low-traffic periods
3. **Implement Gradual Transition**: Use a blue-green deployment approach
4. **Comprehensive Testing**: Test the migration process in a staging environment
5. **Monitoring**: Set up monitoring to detect any issues during and after migration

## Conclusion

The parent-child relationship model in OpenFGA provides a robust foundation for tenant migration in NeuralLog. By leveraging this model, we can perform seamless migrations between Kubernetes namespaces with minimal disruption to users and services.
