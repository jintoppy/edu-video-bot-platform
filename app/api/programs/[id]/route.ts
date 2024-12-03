import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { checkAuth } from "@/lib/checkAuth";
import { db } from "@/lib/db";
import { programs } from "@/lib/db/schema";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const authResult = await checkAuth();
  if (authResult.error || !authResult.user) {
    return NextResponse.json(authResult, { status: 401 });
  }

  try {
    const program = await db.query.programs.findFirst({
      where: eq(programs.id, params.id),
    });

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    return NextResponse.json(program);
  } catch (error) {
    console.error("Error fetching program:", error);
    return NextResponse.json(
      { error: "Failed to fetch program details" },
      { status: 500 }
    );
  }
}
