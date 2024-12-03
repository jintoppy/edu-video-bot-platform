import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { counselorInvitations } from '@/lib/db/schema';
import { clerkClient } from '@/lib/clerk';
import { checkAuth } from '@/lib/checkAuth';

export async function POST(req: Request) {
  try {
    const authResult = await checkAuth();
    if (authResult.error || !authResult.user){
        return NextResponse.json(authResult, { status: authResult.status });
    }
    
    const { name, email } = await req.json();
    
    // Check if invitation already exists
    const existingInvitation = await db.query.counselorInvitations.findFirst({
      where: (invitations, { eq, and }) => 
        and(eq(invitations.email, email), eq(invitations.status, 'pending'))
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'Invitation already sent' },
        { status: 400 }
      );
    }

    // Create Clerk invitation with custom redirect URL
    const clerkInvitation = await clerkClient.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/counselor/signup?email=${email}`,
      publicMetadata: {
        role: 'counselor'
      },
    });

    // Store invitation in your database
    const invitation = await db.insert(counselorInvitations).values({
      email,
      clerkInvitationId: clerkInvitation.id,
      invitedBy: authResult.user.id,
    }).returning();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send invitation:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}