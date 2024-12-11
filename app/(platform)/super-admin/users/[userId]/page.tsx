import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/actions/user";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default async function UserDetailsPage(
  props: {
    params: Promise<{ userId: string }>;
  }
) {
  const params = await props.params;
  const { userId: currentUserId } = await auth();

  if (!currentUserId) {
    redirect("/sign-in");
  }

  const user = await getUser(params.userId);

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <Link href="/super-admin/users">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <p className="text-muted-foreground">{user.email}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="text-lg font-semibold">User Information</CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Role</label>
                <div className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${user.role === 'org:admin' ? 'bg-purple-100 text-purple-800' : 
                    user.role === 'org:member' ? 'bg-blue-100 text-blue-800' : 
                    'bg-green-100 text-green-800'}`}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created At</label>
                <p className="mt-1">{user.createdAt && new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="mt-1">{user.updatedAt && new Date(user.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-lg font-semibold">Organization Details</CardHeader>
          <CardContent>
            {user.organization ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Organization Name</label>
                  <p className="mt-1">{user.organization.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Subdomain</label>
                  <p className="mt-1">{user.organization.subdomain}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${user.organization.status === 'active' ? 'bg-green-100 text-green-800' : 
                      user.organization.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {user.organization.status.charAt(0).toUpperCase() + user.organization.status.slice(1)}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No organization associated</p>
            )}
          </CardContent>
        </Card>
       
      </div>

      <div className="mt-8">
        <Separator className="my-4" />
        <div className="flex justify-end gap-4">
          <Button variant="outline">Reset Password</Button>
          <Button variant="destructive">Deactivate User</Button>
        </div>
      </div>
    </div>
  );
}
