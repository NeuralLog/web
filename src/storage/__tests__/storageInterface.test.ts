import { StorageInterface, LocalStorageAdapter } from '../storageInterface';

describe('StorageInterface', () => {
  let storage: StorageInterface;
  
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    storage = new LocalStorageAdapter();
  });
  
  describe('get', () => {
    it('should return null when key does not exist', async () => {
      // Act
      const value = await storage.get('non-existent-key');
      
      // Assert
      expect(value).toBeNull();
    });
    
    it('should return value when key exists', async () => {
      // Arrange
      const testData = { test: 'value' };
      localStorage.setItem('test-key', JSON.stringify(testData));
      
      // Act
      const value = await storage.get('test-key');
      
      // Assert
      expect(value).toEqual(testData);
    });
  });
  
  describe('set', () => {
    it('should store value in localStorage', async () => {
      // Arrange
      const testData = { test: 'value' };
      
      // Act
      await storage.set('test-key', testData);
      
      // Assert
      const storedValue = JSON.parse(localStorage.getItem('test-key') || 'null');
      expect(storedValue).toEqual(testData);
    });
  });
  
  describe('delete', () => {
    it('should remove key from localStorage', async () => {
      // Arrange
      localStorage.setItem('test-key', JSON.stringify({ test: 'value' }));
      
      // Act
      await storage.delete('test-key');
      
      // Assert
      expect(localStorage.getItem('test-key')).toBeNull();
    });
    
    it('should not fail when key does not exist', async () => {
      // Act & Assert
      await expect(storage.delete('non-existent-key')).resolves.not.toThrow();
    });
  });
});
