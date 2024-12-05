'use server';

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, organizations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getUsers() {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const allUsers = await db
    .select({
      id: users.id,
      name: users.fullName,
      email: users.email,
      role: users.role,
      organizationId: users.organizationId,
      organization: {
        id: organizations.id,
        name: organizations.name,
      },
      createdAt: users.createdAt,
    })
    .from(users)
    .leftJoin(organizations, eq(users.organizationId, organizations.id));

  return allUsers;
}

export async function getUser(userId: string) {
  const { userId: currentUserId } = await auth();
  
  if (!currentUserId) {
    throw new Error("Unauthorized");
  }

  const user = await db
    .select({
      id: users.id,
      name: users.fullName,
      email: users.email,
      role: users.role,
      organizationId: users.organizationId,
      organization: {
        id: organizations.id,
        name: organizations.name,
        subdomain: organizations.subdomain,
        status: organizations.status,
      },
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .leftJoin(organizations, eq(users.organizationId, organizations.id))
    .where(eq(users.id, userId))
    .limit(1);

  if (!user || user.length === 0) {
    throw new Error("User not found");
  }

  return user[0];
}
