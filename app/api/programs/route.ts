import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { checkAuth } from "@/lib/checkAuth";
import { db } from "@/lib/db";
import { studentProfiles, programs, chatSessions } from "@/lib/db/schema";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country");
  const level = searchParams.get("level");
  const orgId = searchParams.get("orgId");

  if (!orgId) {
    return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
  }

  const conditions = [
    eq(programs.isActive, true),
    eq(programs.organizationId, orgId)
  ];

  if (country) conditions.push(eq(programs.country, country));
  if (level) conditions.push(eq(programs.level, level));

  const query = db.select().from(programs).where(and(...conditions));
  const results = await query;
  
  return NextResponse.json(results);
}

export async function POST(req: Request) {
  const authResult = await checkAuth();
  if (authResult.error || !authResult.user) {
    return NextResponse.json(authResult, { status: authResult.status });
  }

  const data = await req.json();
  const program = await db.insert(programs).values(data);
  return NextResponse.json(program);
}

export async function PUT(req: Request) {
  const authResult = await checkAuth();
  if (authResult.error || !authResult.user) {
    return NextResponse.json(authResult, { status: authResult.status });
  }

  const { id, ...data } = await req.json();
  await db.update(programs).set(data).where(eq(programs.id, id));

  return NextResponse.json({ success: true });
}
