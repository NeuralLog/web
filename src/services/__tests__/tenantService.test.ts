import { jest } from '@jest/globals';

// Mock the fgaService
jest.mock('../fgaService', () => {
  const mockCheck = jest.fn().mockResolvedValue({ allowed: true });
  const mockWrite = jest.fn().mockResolvedValue({});
  
  return {
    initializeFga: jest.fn().mockResolvedValue({
      check: mockCheck,
      write: mockWrite
    })
  };
});

// Import the tenant service functions after mocking
import {
  isUserInTenant,
  isUserTenantAdmin,
  addUserToTenant,
  removeUserFromTenant,
  createTenant,
  migrateTenant
} from '../tenantService';

describe('Tenant Service', () => {
  // Test that the module can be imported without errors
  it('should import the module without errors', () => {
    expect(isUserInTenant).toBeDefined();
    expect(isUserTenantAdmin).toBeDefined();
    expect(addUserToTenant).toBeDefined();
    expect(removeUserFromTenant).toBeDefined();
    expect(createTenant).toBeDefined();
    expect(migrateTenant).toBeDefined();
  });
});
