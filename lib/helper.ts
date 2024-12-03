import { chatSessions } from "@/lib/db/schema";

export function calculateAverageDuration(
  sessions: (typeof chatSessions.$inferSelect)[]
) {
  const durationsInMs = sessions
    .filter((s) => s.endTime)
    .map(
      (s) => new Date(s.endTime!).getTime() - new Date(s.startTime).getTime()
    );

  return durationsInMs.length
    ? durationsInMs.reduce((acc, cur) => acc + cur, 0) / durationsInMs.length
    : 0;
}

export function analyzeSentiment(
  sessions: (typeof chatSessions.$inferSelect)[]
) {
  const scores = sessions
    .filter((s) => s.sentimentScore !== null)
    .map((s) => s.sentimentScore!);

  return scores.length
    ? scores.reduce((acc, cur) => acc + cur, 0) / scores.length
    : 0;
}

export function calculateConversionRate(
  sessions: (typeof chatSessions.$inferSelect)[]
) {
  const totalSessions = sessions.length;
  const conversions = sessions.filter(
    (s) => s.recommendations && s.endTime
  ).length;

  return totalSessions ? (conversions / totalSessions) * 100 : 0;
}
