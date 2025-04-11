import { generateApiKey } from '../apiKey';

describe('API Key Utilities', () => {
  describe('generateApiKey', () => {
    it('should generate an API key with the correct format', () => {
      // Act
      const apiKey = generateApiKey();

      // Assert
      expect(apiKey).toMatch(/^nl_[a-zA-Z0-9]{32}-[a-zA-Z0-9]{32}$/);
    });

    it('should generate unique API keys', () => {
      // Act
      const apiKey1 = generateApiKey();
      const apiKey2 = generateApiKey();

      // Assert
      expect(apiKey1).not.toEqual(apiKey2);
    });

    it('should include both letters and numbers', () => {
      // Act
      const apiKey = generateApiKey();

      // Assert
      expect(apiKey).toMatch(/[a-zA-Z]/);
      expect(apiKey).toMatch(/[0-9]/);
    });
  });
});
