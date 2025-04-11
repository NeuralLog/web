import { 
  getCurrentUser, 
  getUserById, 
  getUsersByTenant,
  isUserInTenant,
  addUserToTenant,
  removeUserFromTenant
} from '../userService';

// Mock the Clerk client
jest.mock('@clerk/nextjs', () => ({
  currentUser: jest.fn(),
  clerkClient: {
    users: {
      getUser: jest.fn(),
      getUserList: jest.fn(),
    },
  },
}));

// Mock the OpenFGA client
jest.mock('@/services/fgaService', () => ({
  isUserInTenant: jest.fn(),
  addUserToTenant: jest.fn(),
  removeUserFromTenant: jest.fn(),
}));

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('getCurrentUser', () => {
    it('should return the current user from Clerk', async () => {
      // Arrange
      const mockUser = { id: 'user_123', firstName: 'Test', lastName: 'User' };
      require('@clerk/nextjs').currentUser.mockResolvedValue(mockUser);
      
      // Act
      const user = await getCurrentUser();
      
      // Assert
      expect(user).toEqual(mockUser);
      expect(require('@clerk/nextjs').currentUser).toHaveBeenCalled();
    });
    
    it('should return null when no user is authenticated', async () => {
      // Arrange
      require('@clerk/nextjs').currentUser.mockResolvedValue(null);
      
      // Act
      const user = await getCurrentUser();
      
      // Assert
      expect(user).toBeNull();
    });
  });
  
  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      // Arrange
      const mockUser = { id: 'user_123', firstName: 'Test', lastName: 'User' };
      require('@clerk/nextjs').clerkClient.users.getUser.mockResolvedValue(mockUser);
      
      // Act
      const user = await getUserById('user_123');
      
      // Assert
      expect(user).toEqual(mockUser);
      expect(require('@clerk/nextjs').clerkClient.users.getUser).toHaveBeenCalledWith('user_123');
    });
    
    it('should return null when user is not found', async () => {
      // Arrange
      require('@clerk/nextjs').clerkClient.users.getUser.mockRejectedValue(new Error('User not found'));
      
      // Act
      const user = await getUserById('non_existent_user');
      
      // Assert
      expect(user).toBeNull();
    });
  });
  
  describe('getUsersByTenant', () => {
    it('should return users for a tenant', async () => {
      // Arrange
      const mockUsers = [
        { id: 'user_123', firstName: 'Test', lastName: 'User' },
        { id: 'user_456', firstName: 'Another', lastName: 'User' },
      ];
      require('@clerk/nextjs').clerkClient.users.getUserList.mockResolvedValue(mockUsers);
      
      // Act
      const users = await getUsersByTenant('test-tenant');
      
      // Assert
      expect(users).toEqual(mockUsers);
      expect(require('@clerk/nextjs').clerkClient.users.getUserList).toHaveBeenCalled();
    });
  });
  
  describe('isUserInTenant', () => {
    it('should check if a user is in a tenant', async () => {
      // Arrange
      require('@/services/fgaService').isUserInTenant.mockResolvedValue(true);
      
      // Act
      const result = await isUserInTenant('user_123', 'test-tenant');
      
      // Assert
      expect(result).toBe(true);
      expect(require('@/services/fgaService').isUserInTenant).toHaveBeenCalledWith('test-tenant', 'user_123');
    });
  });
  
  describe('addUserToTenant', () => {
    it('should add a user to a tenant', async () => {
      // Arrange
      require('@/services/fgaService').addUserToTenant.mockResolvedValue(undefined);
      
      // Act
      await addUserToTenant('user_123', 'test-tenant', false);
      
      // Assert
      expect(require('@/services/fgaService').addUserToTenant).toHaveBeenCalledWith('test-tenant', 'user_123', false);
    });
  });
  
  describe('removeUserFromTenant', () => {
    it('should remove a user from a tenant', async () => {
      // Arrange
      require('@/services/fgaService').removeUserFromTenant.mockResolvedValue(undefined);
      
      // Act
      await removeUserFromTenant('user_123', 'test-tenant');
      
      // Assert
      expect(require('@/services/fgaService').removeUserFromTenant).toHaveBeenCalledWith('test-tenant', 'user_123');
    });
  });
});
