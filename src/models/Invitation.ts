/**
 * User invitation model
 */
export interface Invitation {
  /**
   * Unique ID for the invitation
   */
  id: string;

  /**
   * Email address of the invitee
   */
  email: string;

  /**
   * ID of the user who sent the invitation
   */
  invitedBy: string;

  /**
   * When the invitation was created
   */
  createdAt: Date;

  /**
   * When the invitation expires
   */
  expiresAt: Date;

  /**
   * Whether the invitation has been used
   */
  used: boolean;

  /**
   * When the invitation was used
   */
  usedAt?: Date;
}
