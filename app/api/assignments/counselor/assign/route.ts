import { checkAuth } from "@/lib/checkAuth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { counselorAssignments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    const authResult = await checkAuth();
    if (authResult.error || !authResult.user) {
      return NextResponse.json(authResult, { status: 401 });
    }

    try {
        const { conversationId } = await req.json();

        // Update the assignment with the counselor ID
        const result = await db
            .update(counselorAssignments)
            .set({ 
                counselorId: authResult.user.id,
                status: "assigned",
                assignedAt: new Date(),
                updatedAt: new Date()
            })
            .where(eq(counselorAssignments.conversationId, conversationId))
            .returning();

        return NextResponse.json(result[0]);
    } catch (error) {
        console.error('Error assigning counselor:', error);
        return NextResponse.json(
            { error: 'Failed to assign counselor' },
            { status: 500 }
        );
    }
}
