# Tests

This directory contains integration tests for the sim-feed project.

## Directory Structure

```
tests/
├── .gitignore
├── README.md
└── integration-tests/
    ├── __tests__/
    │   ├── api/
    │   │   ├── personas-endpoints.test.ts
    │   │   └── posts-endpoints.test.ts
    │   └── scheduler-engine/
    │       ├── auths-endpoints.test.ts
    │       ├── base-endpoints.test.ts
    │       ├── personas-endpoints.test.ts
    │       └── scheduler-endpoints.test.ts
    ├── configs/
    │   └── urls.mjs
    ├── types/
    │   └── global.d.ts
    ├── Dockerfile.test
    ├── compose.yaml
    ├── jest.config.js
    ├── package.json
    ├── pnpm-lock.yaml
    ├── pnpm-workspace.yaml
    ├── setupTests.ts
    └── tsconfig.json
```

## Integration Tests

The integration tests are located in `integration-tests/` and use Jest with TypeScript to test the API and Scheduler Engine services.

### Test Suites

- **API Tests** (`__tests__/api/`): Tests for the sim-feed API endpoints
  - `personas-endpoints.test.ts` - Tests for persona-related endpoints
  - `posts-endpoints.test.ts` - Tests for post-related endpoints

- **Scheduler Engine Tests** (`__tests__/scheduler-engine/`): Tests for the scheduler engine endpoints
  - `auths-endpoints.test.ts` - Tests for authentication endpoints
  - `base-endpoints.test.ts` - Tests for base/health check endpoints
  - `personas-endpoints.test.ts` - Tests for persona-related endpoints
  - `scheduler-endpoints.test.ts` - Tests for scheduler-related endpoints

### Running Tests

All tests run inside Docker containers using Docker Compose. From the `integration-tests/` directory:

```bash
# Build and run all integration tests
docker compose up --build

# Run tests and tear down afterwards
docker compose up --build && docker compose down -v

# Tear down containers and volumes
docker compose down -v
```

The test execution flow:
1. Docker Compose builds all service containers
2. The database container starts and becomes healthy
3. The API and Scheduler Engine containers start and wait for the database
4. The `test-runner` container waits for all services to be healthy
5. The `test-runner` executes Jest tests against the running services

### Docker Services

The `compose.yaml` defines the following services:

- **app**: Scheduler Engine (Python/FastAPI) on port 8000
- **api**: Sim-feed API (Node.js) on port 3000
- **db**: PostgreSQL database on port 5432
- **test-runner**: Jest test runner container

### Configuration

- `configs/urls.mjs` - URL configuration for test endpoints
- `types/global.d.ts` - TypeScript global type definitions
- `setupTests.ts` - Jest setup and configuration