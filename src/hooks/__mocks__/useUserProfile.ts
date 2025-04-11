// Mock implementation of the useUserProfile hook
import { UserProfileData, User } from '../useUserProfile';

// Default mock data
const defaultMockData: UserProfileData = {
  user: null,
  tenantId: null,
  loading: true,
  error: null
};

// Current mock data that can be changed by tests
let currentMockData = { ...defaultMockData };

// Reset the mock data to default
export const resetMockData = (): void => {
  currentMockData = { ...defaultMockData };
};

// Set custom mock data for a test
export const setMockData = (mockData: Partial<UserProfileData>): void => {
  currentMockData = { ...currentMockData, ...mockData };
};

// The mocked hook
export const useUserProfile = jest.fn().mockImplementation((): UserProfileData => {
  return currentMockData;
});
