# NeuralLog End-to-End Tests

This directory contains end-to-end tests for the NeuralLog web application using Playwright.

## Test Structure

### Test Files

The tests are organized by feature:

- `auth.spec.ts`: Tests for user authentication (registration, login, logout)
- `simple-auth.spec.ts`: Basic navigation tests for authentication-related pages
- `ui-elements.spec.ts`: Tests for UI elements on various pages
- `screenshot.spec.ts`: Utility for taking screenshots and HTML snapshots of key pages
- `snapshot-comparison.spec.ts`: Tests for comparing HTML snapshots with baseline
- `home.spec.ts`: Tests for the home page
- `dashboard.spec.ts`: Tests for the dashboard page
- `navigation.spec.ts`: Tests for navigation between pages
- `tenant.spec.ts`: Tests for tenant management
- `api-keys.spec.ts`: Tests for API key management

### Page Objects

The tests use the Page Object Model pattern for better organization and reusability:

- `page-objects/BasePage.ts`: Base page object with common methods
- `page-objects/HomePage.ts`: Home page object
- `page-objects/LoginPage.ts`: Login page object
- `page-objects/SignUpPage.ts`: Sign-up page object
- `page-objects/DashboardPage.ts`: Dashboard page object

### Selectors

All selectors are centralized in a single file for easier maintenance:

- `selectors/index.ts`: Contains all selectors used in the tests

### Helpers

Helper functions for testing:

- `helpers/test-data.ts`: Contains functions for generating random test data
- `helpers/snapshot.ts`: Contains functions for taking screenshots and HTML snapshots
- `helpers/compare-snapshots.ts`: Contains functions for comparing HTML snapshots

## Running the Tests

You can run the tests using the following commands:

```bash
# Run all E2E tests
npx playwright test

# Run a specific test file
npx playwright test e2e/simple-auth.spec.ts

# Run tests with UI mode (for debugging)
npx playwright test --ui

# Run tests in headed mode (to see the browser)
npx playwright test --headed

# Run tests for a specific browser
npx playwright test --project=chromium
```

Or using the npm scripts:

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI mode (for debugging)
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Take screenshots and HTML snapshots
npm run test:e2e:snapshots

# Compare HTML snapshots with baseline
npm run test:e2e:compare

# Update baseline HTML snapshots
npm run test:e2e:update-baseline
```

## Test Environment Setup

The tests assume that:

1. The application is running locally on port 3000
2. The Docker services (Redis, OpenFGA) are running
3. The development setup script has been run to create the default tenant and test user

To set up the environment before running tests:

```bash
# Start Docker services and run setup script
npm run dev:setup
```

## Test User Credentials

The tests use the following test user credentials:

- Admin user: `admin@example.com` / `Admin@123456`
- Regular user: `user@example.com` / `User@123456`

These users should be created as part of the development setup script.

## CI/CD Integration

The tests are configured to run in CI/CD environments. In CI mode:

- Tests will retry failed tests up to 2 times
- Screenshots will be taken on test failures
- Traces will be recorded for failed tests

## Extending the Tests

When adding new tests:

1. Create a new spec file for the feature you're testing
2. Follow the existing patterns for test organization
3. Use page objects for complex UI interactions
4. Keep tests independent and idempotent

## Known Issues

1. The application has a warning about using `params.tenant` synchronously in the tenant layout
2. Clerk authentication is configured to redirect to neurallog.app, which has been fixed for local development
3. Some server-side components may not work correctly in the browser environment
4. The tests currently don't test actual authentication with Clerk, only navigation to auth pages
