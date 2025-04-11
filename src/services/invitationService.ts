import { Invitation } from '../models/Invitation';

/**
 * Service for managing user invitations
 */
class InvitationService {
  private static STORAGE_KEY = 'neurallog_invitations';

  /**
   * Get all invitations
   */
  async getInvitations(): Promise<Invitation[]> {
    try {
      // In a real application, this would be fetched from a database
      // For now, we'll use localStorage in the browser
      if (typeof window !== 'undefined') {
        const storedInvitations = localStorage.getItem(InvitationService.STORAGE_KEY);
        if (storedInvitations) {
          const invitations = JSON.parse(storedInvitations);
          // Convert date strings back to Date objects
          return invitations.map((invitation: any) => ({
            ...invitation,
            createdAt: new Date(invitation.createdAt),
            expiresAt: new Date(invitation.expiresAt),
            usedAt: invitation.usedAt ? new Date(invitation.usedAt) : undefined
          }));
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error getting invitations:', error);
      return [];
    }
  }

  /**
   * Save invitations
   */
  private async saveInvitations(invitations: Invitation[]): Promise<void> {
    try {
      // In a real application, this would be saved to a database
      // For now, we'll use localStorage in the browser
      if (typeof window !== 'undefined') {
        localStorage.setItem(InvitationService.STORAGE_KEY, JSON.stringify(invitations));
      }
    } catch (error) {
      console.error('Error saving invitations:', error);
      throw new Error('Failed to save invitations');
    }
  }

  /**
   * Create a new invitation
   */
  async createInvitation(email: string, invitedBy: string): Promise<Invitation> {
    // Get existing invitations
    const invitations = await this.getInvitations();
    
    // Check if an invitation already exists for this email
    const existingInvitation = invitations.find(
      invitation => invitation.email === email && !invitation.used
    );
    
    if (existingInvitation) {
      return existingInvitation;
    }
    
    // Create a new invitation
    const invitation: Invitation = {
      id: crypto.randomUUID(),
      email,
      invitedBy,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      used: false
    };
    
    // Save the invitation
    await this.saveInvitations([...invitations, invitation]);
    
    return invitation;
  }

  /**
   * Get an invitation by ID
   */
  async getInvitationById(id: string): Promise<Invitation | null> {
    const invitations = await this.getInvitations();
    return invitations.find(invitation => invitation.id === id) || null;
  }

  /**
   * Get an invitation by email
   */
  async getInvitationByEmail(email: string): Promise<Invitation | null> {
    const invitations = await this.getInvitations();
    return invitations.find(
      invitation => invitation.email === email && !invitation.used
    ) || null;
  }

  /**
   * Mark an invitation as used
   */
  async useInvitation(id: string): Promise<boolean> {
    const invitations = await this.getInvitations();
    const invitation = invitations.find(invitation => invitation.id === id);
    
    if (!invitation) {
      return false;
    }
    
    // Check if invitation is expired
    if (invitation.expiresAt < new Date()) {
      return false;
    }
    
    // Check if invitation is already used
    if (invitation.used) {
      return false;
    }
    
    // Mark invitation as used
    invitation.used = true;
    invitation.usedAt = new Date();
    
    // Save the updated invitations
    await this.saveInvitations(invitations);
    
    return true;
  }

  /**
   * Delete an invitation
   */
  async deleteInvitation(id: string): Promise<boolean> {
    const invitations = await this.getInvitations();
    const updatedInvitations = invitations.filter(invitation => invitation.id !== id);
    
    if (updatedInvitations.length === invitations.length) {
      return false;
    }
    
    // Save the updated invitations
    await this.saveInvitations(updatedInvitations);
    
    return true;
  }
}

// Export singleton instance
export const invitationService = new InvitationService();
