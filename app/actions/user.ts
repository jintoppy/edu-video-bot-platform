'use server';
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { users } from "@/lib/db/schema";


export const getUserRole = async (userId: string) => {
    if (!userId) return;
    
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    return dbUser ? dbUser.role : null;
};