import { NextRequest, NextResponse } from 'next/server';
import { verifyApiKey } from '@/auth/apiKeyVerification';

/**
 * Middleware to verify API keys for protected routes
 * 
 * @param req The Next.js request object
 * @param requiredScopes Optional array of scopes that the API key must have
 * @returns NextResponse or null if verification passes
 */
export async function apiKeyMiddleware(
  req: NextRequest,
  requiredScopes: string[] = []
): Promise<NextResponse | null> {
  // Get API key from headers
  const apiKey = req.headers.get('x-api-key');
  const apiKeyProof = req.headers.get('x-api-key-proof');
  
  // Verify the API key
  const result = await verifyApiKey(apiKey || '', requiredScopes, {
    useZkp: !!apiKeyProof,
    proof: apiKeyProof || ''
  });
  
  // If the key is invalid, return an error response
  if (!result.isValid) {
    return NextResponse.json(
      { error: result.error },
      { status: result.error === 'Insufficient permissions' ? 403 : 401 }
    );
  }
  
  // Key is valid, continue to the API route
  return null;
}
