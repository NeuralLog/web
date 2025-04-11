import { NextRequest, NextResponse } from 'next/server';
import { getApiKeys } from '@/services/apiKeyService';

/**
 * Verifies an API key from the request headers
 * Supports optional zero-knowledge proof verification
 * 
 * @param req The Next.js request object
 * @param requiredScopes Optional array of scopes that the API key must have
 * @param useZkp Whether to use zero-knowledge proof verification
 * @returns NextResponse with error or null if verification passes
 */
export async function verifyApiKey(
  req: NextRequest,
  requiredScopes: string[] = [],
  useZkp: boolean = false
): Promise<NextResponse | null> {
  // Get API key from headers
  const apiKey = req.headers.get('x-api-key');
  
  // Check if API key is provided
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key is required' },
      { status: 401 }
    );
  }
  
  // Get all API keys
  const keys = await getApiKeys();
  
  // Find matching key by prefix
  const keyPrefix = apiKey.substring(0, 8);
  const matchingKey = keys.find(key => key.keyPrefix === keyPrefix);
  
  // Check if key exists
  if (!matchingKey) {
    return NextResponse.json(
      { error: 'Invalid API key' },
      { status: 401 }
    );
  }
  
  // If zero-knowledge proof is enabled, verify the proof
  if (useZkp) {
    const proof = req.headers.get('x-api-key-proof');
    
    if (!proof) {
      return NextResponse.json(
        { error: 'API key proof is required when using zero-knowledge verification' },
        { status: 401 }
      );
    }
    
    // Verify the proof
    const isValidProof = await verifyZeroKnowledgeProof(apiKey, proof);
    
    if (!isValidProof) {
      return NextResponse.json(
        { error: 'Invalid API key proof' },
        { status: 401 }
      );
    }
  }
  
  // Check if key has required scopes
  if (requiredScopes.length > 0) {
    const hasRequiredScopes = requiredScopes.every(scope => 
      matchingKey.scopes.includes(scope)
    );
    
    if (!hasRequiredScopes) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
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
  
  // Key is valid, continue to the API route
  return null;
}

/**
 * Verifies a zero-knowledge proof for an API key
 * 
 * @param apiKey The API key to verify
 * @param proof The proof to verify
 * @returns Whether the proof is valid
 */
async function verifyZeroKnowledgeProof(apiKey: string, proof: string): Promise<boolean> {
  try {
    // In a real implementation, this would use a proper ZKP library
    // For now, we'll use a simple hash comparison as a placeholder
    
    // Hash the API key
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    // Convert hash to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Compare the hash with the provided proof
    return hashHex === proof;
  } catch (error) {
    console.error('Error verifying zero-knowledge proof:', error);
    return false;
  }
}
