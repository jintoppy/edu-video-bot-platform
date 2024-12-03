import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { checkAuth } from "@/lib/checkAuth";
import { db } from "@/lib/db";
import { studentProfiles, programs, chatSessions } from "@/lib/db/schema";
import {
  analyzeSentiment,
  calculateAverageDuration,
  calculateConversionRate,
} from "@/lib/helper";

export async function GET(req: Request) {
  const authResult = await checkAuth();
  if (authResult.error || !authResult.user) {
    return NextResponse.json(authResult, { status: authResult.status });
  }

  const sessions = await db.query.chatSessions.findMany({
    orderBy: (sessions, { desc }) => [desc(sessions.createdAt)],
    limit: 100,
  });

  const metrics = {
    totalSessions: sessions.length,
    averageDuration: calculateAverageDuration(sessions),
    sentimentAnalysis: analyzeSentiment(sessions),
    conversionRate: calculateConversionRate(sessions),
  };

  return NextResponse.json(metrics);
}
