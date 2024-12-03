import { NextResponse } from "next/server";
import { checkAuth } from "@/lib/checkAuth";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { chatSessions } from "@/lib/db/schema";

export async function POST(req: Request) {
  const authResult = await checkAuth();
  if (authResult.error || !authResult.user) {
    return NextResponse.json(authResult, { status: authResult.status });
  }

  const data = await req.json();
  const session = await db.insert(chatSessions).values({
    ...data,
    studentId: authResult.user.id,
    startTime: new Date(),
  });

  return NextResponse.json(session);
}

export async function PUT(req: Request) {
    const authResult = await checkAuth();
    if (authResult.error) return NextResponse.json(authResult, { status: authResult.status });
  
    const { id, ...data } = await req.json();
    await db.update(chatSessions)
      .set({ ...data, endTime: new Date() })
      .where(eq(chatSessions.id, id));
  
    return NextResponse.json({ success: true });
  }