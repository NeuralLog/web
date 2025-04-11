import { SystemSettings, DEFAULT_SYSTEM_SETTINGS } from '../models/SystemSettings';

/**
 * Service for managing system settings
 */
class SystemSettingsService {
  private static STORAGE_KEY = 'neurallog_system_settings';

  /**
   * Get system settings
   */
  async getSettings(): Promise<SystemSettings> {
    try {
      // In a real application, this would be fetched from a database
      // For now, we'll use localStorage in the browser
      if (typeof window !== 'undefined') {
        const storedSettings = localStorage.getItem(SystemSettingsService.STORAGE_KEY);
        if (storedSettings) {
          const settings = JSON.parse(storedSettings);
          // Convert date strings back to Date objects
          if (settings.registrationLockedAt) {
            settings.registrationLockedAt = new Date(settings.registrationLockedAt);
          }
          return settings;
        }
      }
      
      // If no settings found, return defaults
      return { ...DEFAULT_SYSTEM_SETTINGS };
    } catch (error) {
      console.error('Error getting system settings:', error);
      return { ...DEFAULT_SYSTEM_SETTINGS };
    }
  }

  /**
   * Save system settings
   */
  async saveSettings(settings: SystemSettings): Promise<void> {
    try {
      // In a real application, this would be saved to a database
      // For now, we'll use localStorage in the browser
      if (typeof window !== 'undefined') {
        localStorage.setItem(SystemSettingsService.STORAGE_KEY, JSON.stringify(settings));
      }
    } catch (error) {
      console.error('Error saving system settings:', error);
      throw new Error('Failed to save system settings');
    }
  }

  /**
   * Lock registration after the first user registers
   */
  async lockRegistration(userId: string): Promise<void> {
    const settings = await this.getSettings();
    
    // Only lock if not already locked
    if (!settings.registrationLocked) {
      settings.registrationLocked = true;
      settings.registrationLockedAt = new Date();
      settings.firstUserId = userId;
      
      await this.saveSettings(settings);
    }
  }

  /**
   * Check if registration is locked
   */
  async isRegistrationLocked(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.registrationLocked;
  }
}

// Export singleton instance
export const systemSettingsService = new SystemSettingsService();
