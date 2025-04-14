import axios from 'axios';

/**
 * Service for handling first-time setup operations
 */
export class SetupService {
  private baseUrl: string;

  /**
   * Create a new SetupService
   * 
   * @param baseUrl Base URL of the auth service
   */
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Check if this is the first-time setup
   * 
   * @param tenantId Tenant ID
   * @returns Promise that resolves to true if this is the first-time setup
   */
  public async isFirstTimeSetup(tenantId: string): Promise<boolean> {
    try {
      // Check if there are any users in the tenant
      const response = await axios.get(`${this.baseUrl}/setup/status?tenant_id=${encodeURIComponent(tenantId)}`);
      
      return response.data.isFirstTimeSetup;
    } catch (error) {
      // If the endpoint doesn't exist or returns an error, assume it's not first-time setup
      console.error('Error checking first-time setup status:', error);
      return false;
    }
  }

  /**
   * Complete the first-time setup
   * 
   * @param tenantId Tenant ID
   * @param username Username
   * @param password Password
   * @param encryptedKEK Encrypted KEK
   * @returns Promise that resolves to the setup result
   */
  public async completeSetup(
    tenantId: string,
    username: string,
    password: string,
    encryptedKEK: any
  ): Promise<any> {
    try {
      const response = await axios.post(`${this.baseUrl}/setup/complete`, {
        tenant_id: tenantId,
        username,
        password,
        encrypted_kek: encryptedKEK
      });
      
      return response.data;
    } catch (error) {
      console.error('Error completing setup:', error);
      throw error;
    }
  }
}
