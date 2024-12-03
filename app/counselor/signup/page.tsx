"use client";

import { useSignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const signupSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  specializations: z
    .array(z.string())
    .min(1, "Select at least one specialization"),
  biography: z.string().min(50, "Biography must be at least 50 characters"),
});

type SignupForm = z.infer<typeof signupSchema>;

function CounselorSignup() {
  const searchParams = useSearchParams();
  const { signUp, isLoaded, setActive } = useSignUp();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const email = searchParams.get("email");
  const token = useSearchParams().get("__clerk_ticket");

  if (!token) {
    return <p>No invitation token found.</p>;
  }

  //   useEffect(() => {
  //     // Ensure we have the invitation data from Clerk
  //     if (isLoaded && !signUp.emailAddress) {
  //       router.push('/sign-up'); // Redirect if no invitation data
  //     }
  //   }, [isLoaded, signUp, router]);

  const onSubmit = async (data: SignupForm) => {
    if (!isLoaded) return;

    try {
      setIsLoading(true);

      if (!token) {
        return null;
      }

      // Create the user in Clerk
      const result = await signUp.create({
        strategy: "ticket",
        ticket: token,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName
      });

      if (result.status === "complete") {
        // Create user and profile in your database
        const response = await fetch("/api/counselors/create-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: `${data.firstName} ${data.lastName}`,
            clerkId: result.createdUserId,
            email: email,
            specializations: data.specializations,
            biography: data.biography,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to create profile");
        }

        // Set the user as active
        await setActive({ session: result.createdSessionId });

        // Redirect to counselor dashboard
        router.push("/counselor/dashboard");
      }
    } catch (error) {
      console.error("Error in signup:", error);
      toast.error("Failed to complete signup");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!email) {
    return <div>No Email provided</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Set up your counselor account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="firstName">Enter first name</label>
              <input
                id="firstName"
                type="text"
                {...register("firstName")}
              />
            </div>
            <div>
              <label htmlFor="lastName">Enter last name</label>
              <Input
                id="lastName"
                type="text"
                {...register("lastName")}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className="mt-1"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="specializations"
                className="block text-sm font-medium text-gray-700"
              >
                Specializations
              </label>
              <select
                multiple
                {...register("specializations")}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="undergraduate">Undergraduate Counseling</option>
                <option value="graduate">Graduate Studies</option>
                <option value="mba">MBA Admissions</option>
                <option value="scholarship">Scholarship Guidance</option>
                <option value="visa">Visa Counseling</option>
              </select>
              {errors.specializations && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.specializations.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="biography"
                className="block text-sm font-medium text-gray-700"
              >
                Professional Biography
              </label>
              <textarea
                {...register("biography")}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.biography && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.biography.message}
                </p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Complete Setup"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function CounselorSignupPage(){
  return (
    <Suspense>
      <CounselorSignup />
    </Suspense>
  )
}
