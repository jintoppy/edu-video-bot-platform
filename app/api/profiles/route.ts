import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { checkAuth } from "@/lib/checkAuth";
import { db } from "@/lib/db";
import { studentProfiles } from "@/lib/db/schema";



export async function GET(req: Request) {
    const authResult = await checkAuth();
    if (authResult.error || !authResult.user){
        return NextResponse.json(authResult, { status: authResult.status });
    }
  
    const profile = await db.query.studentProfiles.findFirst({
      where: eq(studentProfiles.userId, authResult.user.id)
    });
  
    return NextResponse.json({ user: authResult.user, profile });
  }
  
  export async function PUT(req: Request) {
    const authResult = await checkAuth();
    if (authResult.error || !authResult.user){
        return NextResponse.json(authResult, { status: authResult.status });
    }
  
    const data = await req.json();
    
    await db.update(studentProfiles)
      .set(data)
      .where(eq(studentProfiles.userId, authResult.user.id));
  
    return NextResponse.json({ success: true });
  }