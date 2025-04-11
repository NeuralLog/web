import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { initializeFga, addUserRelation } from '@/services/fgaService';

/**
 * Clerk Webhook Handler
 * 
 * This API route handles webhooks from Clerk for user events.
 * It syncs user data with our authorization system.
 */
export async function POST(req: Request) {
  // Get the webhook signature from the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');
  
  // Validate the webhook signature
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }
  
  // Get the webhook secret from environment variables
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('Missing CLERK_WEBHOOK_SECRET');
    return new Response('Webhook secret not configured', { status: 500 });
  }
  
  // Get the request body
  const payload = await req.json();
  const body = JSON.stringify(payload);
  
  // Create a new Svix instance with the webhook secret
  const wh = new Webhook(webhookSecret);
  
  let evt: WebhookEvent;
  
  try {
    // Verify the webhook signature
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Invalid signature', { status: 400 });
  }
  
  // Handle the webhook event
  const eventType = evt.type;
  
  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt.data);
        break;
      case 'user.updated':
        await handleUserUpdated(evt.data);
        break;
      case 'user.deleted':
        await handleUserDeleted(evt.data);
        break;
      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error handling webhook ${eventType}:`, error);
    return new Response('Error processing webhook', { status: 500 });
  }
}

/**
 * Handle user.created event
 */
async function handleUserCreated(data: any) {
  const userId = data.id;
  const tenantId = 'default'; // New users are added to the default tenant
  
  try {
    // Initialize OpenFGA
    const fga = await initializeFga();
    
    // Add the user to the default tenant
    await addUserRelation(fga, userId, 'member', `tenant:${tenantId}`);
    
    console.log(`User ${userId} added to tenant ${tenantId}`);
  } catch (error) {
    console.error(`Failed to add user ${userId} to tenant ${tenantId}:`, error);
    throw error;
  }
}

/**
 * Handle user.updated event
 */
async function handleUserUpdated(data: any) {
  // Handle user updates if needed
  console.log(`User updated: ${data.id}`);
}

/**
 * Handle user.deleted event
 */
async function handleUserDeleted(data: any) {
  // Handle user deletion if needed
  console.log(`User deleted: ${data.id}`);
}
