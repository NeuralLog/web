# Docker Networking in NeuralLog

This document explains how the Docker networking is configured in the NeuralLog project and how the different services communicate with each other.

## Service Communication in Docker

In Docker Compose, services can communicate with each other using their service names as hostnames. This is different from local development where you would use `localhost`.

### Key Points

1. **Service Names as Hostnames**: In Docker, services can reach each other using the service name as the hostname.
2. **Internal vs. External Ports**: The ports exposed to the host machine are different from the ports used for internal communication.
3. **Environment Variables**: We use environment variables to configure the URLs for service communication.

## Service URLs in Docker

| Service | Internal URL (Docker) | External URL (Host) |
|---------|----------------------|---------------------|
| Web | http://web:3000 | http://localhost:3000 |
| Logs Server | http://logs-server:3030 | http://localhost:3030 |
| Auth Service | http://auth-service:3040 | http://localhost:3040 |
| Redis | redis:6379 | localhost:6379 |
| OpenFGA | http://openfga:8080 | http://localhost:8080 |

## Environment Variables

The environment variables in `docker-compose.logs.yml` are configured to use the internal Docker URLs:

```yaml
environment:
  - NEXT_PUBLIC_AUTH_SERVICE_API_URL=http://auth-service:3040
  - NEXT_PUBLIC_AUTH_SERVICE_API_KEY=dev-api-key
  - NEXT_PUBLIC_LOGS_SERVICE_API_URL=http://logs-server:3030
  - REDIS_HOST=redis
  - REDIS_PORT=6379
```

## Common Issues and Solutions

### 1. Connection Refused

If you see "Connection refused" errors, it could be because:

- The target service is not running
- You're using `localhost` instead of the service name
- The port is incorrect

**Solution**: Check the service status and make sure you're using the correct service name and port.

```bash
# Check service status
docker-compose -f docker-compose.logs.yml ps

# Check service logs
docker-compose -f docker-compose.logs.yml logs logs-server
```

### 2. Name Resolution Issues

If you see "Name resolution failed" errors, it could be because:

- The Docker network is not properly configured
- The service name is incorrect

**Solution**: Restart the Docker Compose setup and check the network configuration.

```bash
# Restart the entire setup
docker-compose -f docker-compose.logs.yml down
docker-compose -f docker-compose.logs.yml up -d
```

### 3. Testing Connectivity

You can test connectivity between services using the `curl` command from inside a container:

```bash
# Test connectivity from web to logs-server
docker-compose -f docker-compose.logs.yml exec web curl -v http://logs-server:3030/api/logs
```

## Debugging Tools

We've provided a script to check the logs server status:

```bash
check-logs-server.bat
```

This script:
1. Checks the logs server container status
2. Shows the logs server logs
3. Tests the connection from the web container to the logs server

## Local Development vs. Docker

When developing locally (without Docker), you would use:

```
http://localhost:3030  # For logs server
http://localhost:3040  # For auth service
```

But in Docker, you must use:

```
http://logs-server:3030  # For logs server
http://auth-service:3040  # For auth service
```

This is why we use environment variables to configure the URLs, so they can be different in different environments.
