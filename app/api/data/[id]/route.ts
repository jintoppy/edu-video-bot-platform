import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documentation, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkAuth } from "@/lib/checkAuth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await checkAuth();
  if (authResult.error || !authResult.user) {
    return NextResponse.json(authResult, { status: 401 });
  }
  const documentId = (await params).id;

  if (!documentId) {
    return NextResponse.json({ error: "No Doc found" }, { status: 404 });
  }

  try {
    const docs = await db
      .select()
      .from(documentation)
      .where(eq(documentation.id, documentId))
      .orderBy(documentation.updatedAt);

    const response = docs.length > 0 ? docs[0] : null;
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
