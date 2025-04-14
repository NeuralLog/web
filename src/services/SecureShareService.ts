import axios from 'axios';
import { SerializedSecretShare, NeuralLogClient } from '@neurallog/typescript-client-sdk';

/**
 * Interface for a pending admin promotion request
 */
export interface PendingAdminPromotion {
  id: string;
  requesterId: string;
  requesterName: string;
  candidateId: string;
  candidateName: string;
  timestamp: string;
  encryptedShare?: string;
  status: 'pending' | 'approved' | 'rejected';
}

/**
 * Service for securely exchanging shares between admins
 *
 * This service enables end-to-end secure sharing of Shamir's Secret Shares
 * without exposing the actual share content to the UI or server.
 */
export class SecureShareService {
  private authUrl: string;
  private client: NeuralLogClient | null;

  constructor(authUrl: string, client: NeuralLogClient | null = null) {
    this.authUrl = authUrl;
    this.client = client;
  }

  /**
   * Create a new admin promotion request
   *
   * @param candidateId ID of the user to promote
   * @param candidateName Name of the user to promote
   * @param encryptedShares Map of admin IDs to their encrypted shares
   * @returns The created promotion request
   */
  public async createAdminPromotionRequest(
    candidateId: string,
    candidateName: string,
    encryptedShares: Map<string, string>
  ): Promise<PendingAdminPromotion> {
    try {
      const response = await axios.post(
        `${this.authUrl}/admin/promotions`,
        {
          candidateId,
          candidateName,
          encryptedShares: Object.fromEntries(encryptedShares)
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to create admin promotion request:', error);
      throw new Error('Failed to create admin promotion request');
    }
  }

  /**
   * Get pending admin promotion requests for the current user
   *
   * @returns List of pending promotion requests
   */
  public async getPendingPromotions(): Promise<PendingAdminPromotion[]> {
    try {
      const response = await axios.get(
        `${this.authUrl}/admin/promotions/pending`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to get pending promotions:', error);
      throw new Error('Failed to get pending promotions');
    }
  }

  /**
   * Approve an admin promotion request
   *
   * @param promotionId ID of the promotion request
   * @returns The updated promotion request
   */
  public async approvePromotion(promotionId: string): Promise<PendingAdminPromotion> {
    try {
      const response = await axios.post(
        `${this.authUrl}/admin/promotions/${promotionId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to approve promotion:', error);
      throw new Error('Failed to approve promotion');
    }
  }

  /**
   * Reject an admin promotion request
   *
   * @param promotionId ID of the promotion request
   * @returns The updated promotion request
   */
  public async rejectPromotion(promotionId: string): Promise<PendingAdminPromotion> {
    try {
      const response = await axios.post(
        `${this.authUrl}/admin/promotions/${promotionId}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to reject promotion:', error);
      throw new Error('Failed to reject promotion');
    }
  }

  /**
   * Get the encrypted share for a promotion request
   *
   * @param promotionId ID of the promotion request
   * @returns The encrypted share
   */
  public async getEncryptedShare(promotionId: string): Promise<string> {
    try {
      const response = await axios.get(
        `${this.authUrl}/admin/promotions/${promotionId}/share`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      return response.data.encryptedShare;
    } catch (error) {
      console.error('Failed to get encrypted share:', error);
      throw new Error('Failed to get encrypted share');
    }
  }

  /**
   * Encrypt a share for another admin
   *
   * @param share The share to encrypt
   * @param recipientId The recipient's user ID
   * @returns The encrypted share
   */
  public async encryptShareForAdmin(
    share: SerializedSecretShare,
    recipientId: string
  ): Promise<string> {
    try {
      if (!this.client) {
        throw new Error('Client not initialized');
      }

      // Get the recipient's public key
      const recipientPublicKey = await this.client.getUserPublicKey(recipientId);

      // Convert share to string
      const shareString = JSON.stringify(share);

      // Convert to Uint8Array
      const shareData = new TextEncoder().encode(shareString);

      // Use the client's crypto service to encrypt the data
      const encryptedData = await this.client.getCryptoService().encryptWithPublicKey(
        recipientPublicKey,
        shareData
      );

      // Convert to base64 for transmission
      return btoa(String.fromCharCode(...encryptedData));
    } catch (error) {
      console.error('Failed to encrypt share:', error);
      throw new Error('Failed to encrypt share');
    }
  }

  /**
   * Decrypt a share that was encrypted for the current admin
   *
   * @param encryptedShareData The encrypted share data
   * @param userPassword The user's password
   * @returns The decrypted share
   */
  public async decryptShare(
    encryptedShareData: string,
    userPassword: string
  ): Promise<SerializedSecretShare> {
    try {
      if (!this.client) {
        throw new Error('Client not initialized');
      }

      // Get the current user's key pair using their password
      const keyPair = await this.client.getUserKeyPair(userPassword);

      // Convert the base64 string to Uint8Array
      const binaryString = atob(encryptedShareData);
      const encryptedData = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        encryptedData[i] = binaryString.charCodeAt(i);
      }

      // Use the client's crypto service to decrypt the data
      const decryptedData = await this.client.getCryptoService().decryptWithPrivateKey(
        keyPair.privateKey,
        encryptedData
      );

      // Convert to string and parse as JSON
      const shareString = new TextDecoder().decode(decryptedData);
      return JSON.parse(shareString);
    } catch (error) {
      console.error('Failed to decrypt share:', error);
      throw new Error('Failed to decrypt share');
    }
  }
}
