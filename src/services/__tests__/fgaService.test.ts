import { jest } from '@jest/globals';

// Mock the OpenFGA SDK
const mockCheck = jest.fn().mockResolvedValue({ allowed: true });
const mockWrite = jest.fn().mockResolvedValue({});

jest.mock('@openfga/sdk', () => ({
  OpenFGAClient: jest.fn().mockImplementation(() => ({
    check: mockCheck,
    write: mockWrite
  }))
}));

// Mock the tenant context
const mockGetTenantId = jest.fn().mockResolvedValue('test-tenant');
jest.mock('../tenantContext', () => ({
  getTenantId: mockGetTenantId
}));

// Import the functions after mocking
import {
  initializeFga,
  checkUserAccess,
  addUserRelation,
  removeUserRelation
} from '../fgaService';

describe('FGA Service', () => {
  const mockTenantId = 'test-tenant';
  const mockStoreId = 'store_123';
  const mockModelId = 'model_123';

  beforeEach(() => {
    // Reset all mocks before each test
    jest.resetAllMocks();
    mockGetTenantId.mockResolvedValue(mockTenantId);
    mockCheck.mockResolvedValue({ allowed: true });
    mockWrite.mockResolvedValue({});

    // Setup environment variables
    process.env.NEXT_PUBLIC_OPENFGA_API_URL = 'http://localhost:8080';
    process.env.NEXT_PUBLIC_OPENFGA_STORE_ID = mockStoreId;
    process.env.NEXT_PUBLIC_OPENFGA_MODEL_ID = mockModelId;
  });

  afterEach(() => {
    jest.resetAllMocks();
    // Clean up environment variables
    delete process.env.NEXT_PUBLIC_OPENFGA_API_URL;
    delete process.env.NEXT_PUBLIC_OPENFGA_STORE_ID;
    delete process.env.NEXT_PUBLIC_OPENFGA_MODEL_ID;
  });

  // Test that the module can be imported without errors
  it('should import the module without errors', () => {
    expect(initializeFga).toBeDefined();
    expect(checkUserAccess).toBeDefined();
    expect(addUserRelation).toBeDefined();
    expect(removeUserRelation).toBeDefined();
  });
});
