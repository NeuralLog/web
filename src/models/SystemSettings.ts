/**
 * System settings model
 */
export interface SystemSettings {
  /**
   * Whether registration is locked down
   * If true, only existing users can invite new users
   * If false, anyone can register
   */
  registrationLocked: boolean;

  /**
   * The date when registration was locked
   */
  registrationLockedAt?: Date;

  /**
   * The ID of the first user who registered
   */
  firstUserId?: string;
}

/**
 * Default system settings
 */
export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  registrationLocked: false
};
