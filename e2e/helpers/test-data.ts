/**
 * Test data helper
 *
 * This file contains helper functions for generating test data.
 */

/**
 * Generate a random email address
 */
export function generateRandomEmail(): string {
  return `test-user-${Date.now()}@example.com`;
}

/**
 * Generate a random password
 */
export function generateRandomPassword(): string {
  return `Test@${Math.floor(100000 + Math.random() * 900000)}`;
}

/**
 * Generate a random name
 */
export function generateRandomName(): { firstName: string; lastName: string } {
  const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Edward', 'Fiona'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson'];

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

  return { firstName, lastName };
}

/**
 * Test user data
 */
export const testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'Test@123456',
};
