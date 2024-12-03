import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { checkAuth } from "@/lib/checkAuth";
import { db } from "@/lib/db";
import { documentation, documentEmbeddings } from "@/lib/db/schema";
import { generateEmbedding, prepareTextForEmbedding, storeEmbedding, updateEmbedding } from "@/lib/embedding";

export async function GET(req: Request) {
  const authResult = await checkAuth();
  if (authResult.error || !authResult.user) {
    return NextResponse.json(authResult, { status: 401 });
  }

  const results = await db.select().from(documentation);

  return NextResponse.json(results);
}

export async function POST(req: Request) {
  const authResult = await checkAuth();
  if (authResult.error || !authResult.user) {
    return NextResponse.json(authResult, { status: authResult.status });
  }

  const data = await req.json();
  const [doc] = await db.insert(documentation)
      .values({
        ...data,
        createdBy: authResult.user.id,
        updatedBy: authResult.user.id
      })
      .returning();

  const textForEmbedding = prepareTextForEmbedding(doc);
  const { embedding, model, error } = await generateEmbedding(textForEmbedding);

  if (error || !embedding || !model) {
    console.error('Failed to generate embedding:', error);
    // Continue without embedding if there's an error
    return NextResponse.json(doc);
  }

  // Store the embedding
  await storeEmbedding(doc.id, embedding, model);
  
  return NextResponse.json(doc);
}

export async function PUT(req: Request) {
  const authResult = await checkAuth();
  if (authResult.error || !authResult.user) {
    return NextResponse.json(authResult, { status: authResult.status });
  }

  try {
    const { id, ...data } = await req.json();

    // Update the documentation
    await db.update(documentation)
      .set({
        ...data,
        updatedBy: authResult.user.id,
        updatedAt: new Date()
      })
      .where(eq(documentation.id, id));

    // Get the updated document
    const [updatedDoc] = await db.select()
      .from(documentation)
      .where(eq(documentation.id, id));

    // Generate new embedding
    const textForEmbedding = prepareTextForEmbedding(updatedDoc);
    const { embedding, model, error } = await generateEmbedding(textForEmbedding);

    if (error || !embedding || !model) {
      console.error('Failed to generate embedding:', error);
      // Continue without embedding if there's an error
      return NextResponse.json({ success: true });
    }

    // Check if embedding exists
    const existingEmbedding = await db.select()
      .from(documentEmbeddings)
      .where(eq(documentEmbeddings.documentId, id));

    if (existingEmbedding.length > 0) {
      // Update existing embedding
      await updateEmbedding(id, embedding, model);
    } else {
      // Create new embedding if it doesn't exist
      await storeEmbedding(id, embedding, model);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PUT handler:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

