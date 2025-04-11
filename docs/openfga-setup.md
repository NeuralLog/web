# OpenFGA Setup for API Key Authorization

This document explains how to set up and use OpenFGA for API key authorization in the NeuralLog project.

## What is OpenFGA?

OpenFGA (Open Fine-Grained Authorization) is an open-source authorization system that implements the Zanzibar model. It allows us to define and check authorization relationships between users and resources.

In NeuralLog, we use OpenFGA to manage API key authorization using zero-knowledge proofs.

## Zero-Knowledge Proof Approach

Our API key authorization system uses a zero-knowledge proof approach, which means:

1. We **never** store the full API key values anywhere in our system
2. We only store metadata about the keys (ID, prefix, scopes, etc.)
3. Clients prove they know the API key without revealing it
4. OpenFGA stores the authorization relationships (who can use which keys)

## Local Development Setup

### Prerequisites

- Docker and Docker Compose
- Node.js 16+

### Starting OpenFGA

To start OpenFGA locally:

```bash
cd C:\Users\T\Projects\NeuralLog\web
docker-compose up -d
```

This will start:
- A PostgreSQL database for OpenFGA's data
- The OpenFGA server on port 8080

### Accessing the OpenFGA Playground

OpenFGA includes a web-based playground for testing authorization models:

http://localhost:3000

You can use this to explore and test the authorization model.

## Integration with NeuralLog

### API Key Creation

When a user creates an API key:

1. We generate a secure random API key with the format `nl_[32 chars]-[32 chars]`
2. We store only the key metadata (ID, prefix, scopes) in our database
3. We register the key in OpenFGA (creating a relationship between the user and the key)
4. We return the full API key to the user **once** (they must save it)

### API Key Verification

When a client uses an API key:

1. The client sends the API key and a zero-knowledge proof
2. We verify the proof without ever seeing the full key
3. We check if the user has permission to use the key using OpenFGA
4. If verification passes, we allow the operation

## Docker Configuration

The `docker-compose.yml` file configures:

- PostgreSQL as the persistent storage for OpenFGA
- OpenFGA server with the playground enabled
- Proper health checks for both services

## Kubernetes Deployment

For Kubernetes deployment, the infrastructure team will:

1. Deploy PostgreSQL (or use a managed database)
2. Deploy OpenFGA using the official Docker image
3. Configure proper persistence and networking
4. Set up appropriate secrets for database credentials

## Multi-Tenant Support

The OpenFGA implementation supports multi-tenant environments through parent-child relationships:

### Tenant Parent Relationship Model

Instead of simple namespacing, we use a more structured approach with explicit parent-child relationships:

1. **Tenant Type**: A dedicated type for tenants with admin and member relations
2. **Parent Relationship**: API keys have a parent relationship to tenants
3. **Hierarchical Structure**: Creates a formal hierarchy that maps well to Kubernetes namespaces

### Authorization Model

The authorization model defines these relationships:

```json
{
  "type_definitions": [
    {
      "type": "tenant",
      "relations": {
        "admin": { "this": {} },
        "member": { "this": {} }
      }
    },
    {
      "type": "api_key",
      "relations": {
        "owner": { "this": {} },
        "parent": { "this": {} },
        "can_use": {
          "union": {
            "child": [
              { "this": {} },
              { "computedUserset": { "relation": "owner" } }
            ]
          }
        }
      },
      "metadata": {
        "relations": {
          "parent": {
            "directly_related_user_types": [
              { "type": "tenant" }
            ]
          }
        }
      }
    }
  ]
}
```

### How Tenant Parent Relationships Work

1. **Creating a Tenant**: A tenant is created as a distinct object in OpenFGA
2. **User Membership**: Users are assigned as members or admins of tenants
3. **API Key Registration**: When an API key is created, the tenant is set as its parent
4. **Verification Process**: Checks both user membership in the tenant and the API key's parent relationship

### Tenant Migration

This model makes tenant migration between Kubernetes namespaces much simpler:

1. Create a new tenant object with the new namespace ID
2. Copy all user relationships to the new tenant
3. Update the parent relationship for all API keys
4. No need to update individual API keys - they follow their parent

#### Detailed Migration Process

We've implemented a `migrateTenant` function in the `tenantService.ts` file that handles the migration process:

```typescript
export async function migrateTenant(oldTenantId: string, newTenantId: string): Promise<void> {
  // Step 1: Create the new tenant
  // Step 2: Find all users with access to the old tenant
  // Step 3: Copy all user relationships to the new tenant
  // Step 4: Find all API keys belonging to the old tenant
  // Step 5: Update the parent relationship for all API keys
  // Step 6: Verify the migration
}
```

#### Migration in Kubernetes

When migrating a tenant between Kubernetes namespaces:

1. **Preparation**:
   - Create the new namespace in Kubernetes
   - Deploy the necessary services to the new namespace

2. **Data Migration**:
   - Migrate any tenant-specific data (databases, storage, etc.)
   - Use the `migrateTenant` function to update authorization relationships

3. **DNS/Routing Update**:
   - Update DNS records or ingress rules to point to the new namespace
   - Implement a graceful transition period if needed

4. **Verification**:
   - Verify that all services are working in the new namespace
   - Verify that all authorization relationships are correctly migrated

5. **Cleanup**:
   - Once the migration is complete and verified, remove the old namespace

This approach allows for zero-downtime migrations between namespaces, which is critical for production environments.

### Shared OpenFGA Instance

A single OpenFGA instance can serve all tenants in the NeuralLog system. This approach:

- Reduces infrastructure costs
- Simplifies management
- Maintains proper tenant isolation through explicit relationships
- Scales well with the number of tenants
- Facilitates tenant migration between Kubernetes namespaces

## Security Considerations

- API keys are never stored in our system
- OpenFGA only stores authorization relationships, not the keys themselves
- The zero-knowledge proof approach prevents key leakage
- All communication with OpenFGA should be encrypted in production
- Tenant isolation is maintained through proper namespacing

## Further Reading

- [OpenFGA Documentation](https://openfga.dev/docs)
- [Zanzibar Paper](https://research.google/pubs/pub48190/)
- [Zero-Knowledge Proofs](https://en.wikipedia.org/wiki/Zero-knowledge_proof)
