import { DashboardShell } from "@/components/dashboard/shell"
import { DashboardHeader } from "@/components/dashboard/header"
import { ProfileForm } from "@/components/profile/student-profile-form"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/lib/db"
import { studentProfiles, users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export default async function DashboardProfilePage() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  // First get the user's UUID from our database
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId)
  });

  if (!user) {
    return null;
  }
  
  // Fetch existing profile if it exists
  // Fetch both profile and user data
  const [profile, userData] = await Promise.all([
    db.query.studentProfiles.findFirst({
      where: eq(studentProfiles.userId, user.id)
    }),
    db.query.users.findFirst({
      where: eq(users.id, user.id)
    })
  ]);

  if (!userData) {
    return null;
  }

  console.log(userData);

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Profile"
        text="Complete your profile to get personalized program recommendations"
      />
      <ProfileForm 
        initialData={profile} 
        userData={{
          firstName: userData.fullName.split(' ')[0],
          lastName: userData.fullName.split(' ').slice(1).join(' '),
          email: userData.email
        }} 
      />
    </DashboardShell>
  )
}
