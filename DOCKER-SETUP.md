# Docker Development Setup

This guide explains how to set up a local development environment using Docker for the NeuralLog web application.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ installed

## Components

The Docker Compose setup includes the following services:

1. **Web Application**: Next.js web application
2. **Auth Service**: NeuralLog auth service
3. **Redis**: For tenant context and caching
4. **OpenFGA**: For authorization
5. **PostgreSQL**: Database for OpenFGA

## Getting Started

### 1. Start the Docker containers

```bash
npm run docker:up
```

This will start all the services defined in the `docker-compose.yml` file.

### 2. Set up the development environment

```bash
npm run docker:setup
```

This script will:
- Seed Redis with a default tenant
- Create an OpenFGA store and authorization model
- Create a default tenant in OpenFGA
- Add a test user to the default tenant with admin permissions

### 3. View logs (optional)

```bash
npm run docker:logs
```

### 4. Access the services

- Web Application: http://localhost:3000
- Auth Service: http://localhost:3040
- OpenFGA Playground: http://localhost:8080

### 5. Test credentials

- Tenant ID: `default`
- User ID: `test-user`

### 6. Stop the Docker containers

```bash
npm run docker:down
```

## One-step Setup

To start the containers and set up the development environment in one step:

```bash
npm run dev:setup
```

## Troubleshooting

### OpenFGA is not ready

If you encounter errors related to OpenFGA not being ready, wait a few more seconds and try again:

```bash
npm run docker:setup
```

### Redis connection issues

Make sure Redis is running and accessible:

```bash
docker-compose ps
```

### Auth service not connecting to OpenFGA

Check the auth service logs:

```bash
docker-compose logs auth-service
```

## Development Workflow

1. Start the Docker containers: `npm run docker:up`
2. Set up the environment: `npm run docker:setup`
3. Make changes to the code
4. The changes will be automatically reflected due to volume mounting
5. Stop the containers when done: `npm run docker:down`
