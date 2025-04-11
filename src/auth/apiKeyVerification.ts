import { ApiKey } from '@/types/apiKey';
import { getApiKeys } from '@/services/apiKeyService';
import { verifyApiKeyProof } from '@/services/fgaService';

/**
 * Options for API key verification
 */
export interface VerifyApiKeyOptions {
  /**
   * Whether to use zero-knowledge proof verification
   */
  useZkp?: boolean;

  /**
   * The proof to verify (required if useZkp is true)
   */
  proof?: string;
}

/**
 * Result of API key verification
 */
export interface VerifyApiKeyResult {
  /**
   * Whether the API key is valid
   */
  isValid: boolean;

  /**
   * Error message if the API key is invalid
   */
  error?: string;

  /**
   * The API key object if the key is valid
   */
  apiKey?: ApiKey;
}

/**
 * Verifies an API key
 * Supports optional zero-knowledge proof verification
 *
 * @param apiKey The API key to verify
 * @param requiredScopes Optional array of scopes that the API key must have
 * @param options Optional verification options
 * @returns Result of the verification
 */
export async function verifyApiKey(
  apiKey: string,
  requiredScopes: string[] = [],
  options: VerifyApiKeyOptions = {}
): Promise<VerifyApiKeyResult> {
  // Check if API key is provided
  if (!apiKey) {
    return {
      isValid: false,
      error: 'API key is required'
    };
  }

  // Get all API keys
  const keys = await getApiKeys();

  // Find matching key by prefix
  const keyPrefix = apiKey.substring(0, 8);
  const matchingKey = keys.find(key => key.keyPrefix === keyPrefix);

  // Check if key exists
  if (!matchingKey) {
    return {
      isValid: false,
      error: 'Invalid API key'
    };
  }

  // If zero-knowledge proof is enabled, verify the proof
  if (options.useZkp) {
    const proof = options.proof;

    if (!proof) {
      return {
        isValid: false,
        error: 'API key proof is required when using zero-knowledge verification'
      };
    }

    // Verify the proof
    const isValidProof = await verifyZeroKnowledgeProof(apiKey, proof);

    if (!isValidProof) {
      return {
        isValid: false,
        error: 'Invalid API key proof'
      };
    }
  }

  // Check if key has required scopes
  if (requiredScopes.length > 0) {
    const hasRequiredScopes = requiredScopes.every(scope =>
      matchingKey.scopes.includes(scope)
    );

    if (!hasRequiredScopes) {
      return {
        isValid: false,
        error: 'Insufficient permissions'
      };
    }
  }

  // Update last used timestamp
  if (matchingKey.updateLastUsed) {
    matchingKey.updateLastUsed();
  } else {
    // If updateLastUsed is not available, we'll handle it here
    matchingKey.lastUsedAt = new Date().toISOString();
    // Note: In a real implementation, we would save this change to the database
  }

  // Key is valid
  return {
    isValid: true,
    apiKey: matchingKey
  };
}

/**
 * Verifies a zero-knowledge proof for an API key
 *
 * @param apiKey The API key to verify
 * @param proof The proof to verify
 * @returns Whether the proof is valid
 */
export async function verifyZeroKnowledgeProof(apiKey: string, proof: string): Promise<boolean> {
  try {
    // Use OpenFGA to verify the proof
    return await verifyApiKeyProof(apiKey, proof);
  } catch (error) {
    console.error('Error verifying zero-knowledge proof:', error);
    return false;
  }
}
