import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { UserJSON, WebhookEvent } from '@clerk/nextjs/server'
import { db } from "@/lib/db";
import { users, organizationInvitations, organizations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET

  if (!SIGNING_SECRET) {
    throw new Error('Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET)

  // Get headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', {
      status: 400,
    })
  }

  // Get body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  let evt: WebhookEvent

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error: Could not verify webhook:', err)
    return new Response('Error: Verification error', {
      status: 400,
    })
  }

  
  const eventType = evt.type
  if (evt.type === 'user.created') {
    const { id, email_addresses, primary_email_address_id, first_name, last_name } = evt.data;
    const primaryEmailAddress = email_addresses.find(
      email => email.id === primary_email_address_id
    )?.email_address;

    if (!primaryEmailAddress) {
      console.error('No primary email address found');
      return new Response('Error: No primary email address found', { status: 400 });
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, primaryEmailAddress)
    });

    if (existingUser) {
      // Update existing user with clerkId
      await db.update(users)
        .set({ 
          clerkId: id,
          updatedAt: new Date()
        })
        .where(eq(users.email, primaryEmailAddress));
    } else {
      // Create new user
      await db.insert(users).values({
        clerkId: id,
        email: primaryEmailAddress,
        fullName: `${first_name} ${last_name}`
      });
    }
  }

  if (evt.type === 'organizationInvitation.accepted') {
    const invitation = evt.data;
    const { organization_id, public_metadata, role } = invitation;
    
    if (!organization_id) {
      console.error('No orgId found in invitation metadata');
      return new Response('Error: No organization ID found', { status: 400 });
    }

    console.log(invitation);

    // Add the user to users table
    await db.insert(users).values({            
      role: role as 'org:admin' | 'org:member',
      organizationId: public_metadata.orgId as string,
      email: public_metadata.adminEmail as string,
      fullName: public_metadata.adminName as string,
    });

    // Update organization invitation status
    await db.update(organizationInvitations)
      .set({ 
        status: "accepted",
        updatedAt: new Date()
      })
      .where(eq(organizationInvitations.clerkInvitationId, invitation.id));

    // Update organization status to active
    await db.update(organizations)
      .set({ 
        status: "active",
        updatedAt: new Date()
      })
      .where(eq(organizations.id, organization_id));

    console.log('Updated organization, invitation status and created user');
  }

  const { id } = evt.data
  console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
  console.log('Webhook payload:', body)

  return new Response('Webhook received', { status: 200 })
}
