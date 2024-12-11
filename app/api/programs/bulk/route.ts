// app/api/programs/bulk/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { programs } from "@/lib/db/schema";
import { checkAuth } from "@/lib/checkAuth";

export async function POST(req: Request) {
  const authResult = await checkAuth();
  if (authResult.error || !authResult.user) {
    return NextResponse.json(authResult, { status: 401 });
  }

  try {
    const { programs: programsToCreate } = await req.json();

    // Create all programs in a transaction
    const createdPrograms = await db.transaction(async (tx) => {
      const results = [];
      for (const program of programsToCreate) {
        const [created] = await tx.insert(programs).values(program).returning();
        results.push(created);
      }
      return results;
    });

    return NextResponse.json(createdPrograms);
  } catch (error) {
    console.error("Error creating programs:", error);
    return NextResponse.json(
      { error: "Failed to create programs" },
      { status: 500 }
    );
  }
}