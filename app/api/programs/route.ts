import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { checkAuth } from "@/lib/checkAuth";
import { db } from "@/lib/db";
import { studentProfiles, programs, chatSessions } from "@/lib/db/schema";

export async function GET(req: Request) {
  const authResult = await checkAuth();
  if (authResult.error || !authResult.user) {
    return NextResponse.json(authResult, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const country = searchParams.get("country");
  const level = searchParams.get("level");

  const conditions = [eq(programs.isActive, true)];

  if (country) conditions.push(eq(programs.country, country));
  if (level) conditions.push(eq(programs.level, level));

  const query = db.select().from(programs).where(and(...conditions));
  //const query = db.select()

  const results = await query;
  console.log(results);
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
