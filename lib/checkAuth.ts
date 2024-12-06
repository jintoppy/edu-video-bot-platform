import { auth } from '@clerk/nextjs/server';
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";


export const checkAuth = async () => {
  const { userId } = await auth();
  console.log('userId', userId)
  if (!userId) return { error: "Unauthorized", status: 401 };

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  console.log('user', user);

  return { user, role: user?.role };
};
