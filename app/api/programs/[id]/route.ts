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

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const authResult = await checkAuth();
  if (authResult.error || !authResult.user) {
    return NextResponse.json(authResult, { status: 401 });
  }

  try {
    // Check if program exists
    const existingProgram = await db.query.programs.findFirst({
      where: eq(programs.id, params.id),
    });

    if (!existingProgram) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    const userRole = authResult.user.role;
    const isRoleAllowed = userRole === "super_admin" || userRole === "org:admin";
    const orgIdMatching = authResult.user.organizationId === existingProgram.organizationId;

    if(!isRoleAllowed || !orgIdMatching) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete the program
    await db.delete(programs).where(eq(programs.id, params.id));

    return NextResponse.json(
      { message: "Program deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting program:", error);
    return NextResponse.json(
      { error: "Failed to delete program" },
      { status: 500 }
    );
  }
}