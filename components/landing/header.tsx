"use client";
import { ArrowRight, GraduationCap, Globe, Video, Brain } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { UserButton } from "@clerk/nextjs";
import { getUserRole } from "@/app/actions/user";

export default function Header() {
  const { isSignedIn, user } = useUser();
  const [dashboardUrl, setDashboardUrl] = useState("");

  useEffect(() => {
    const getDashboardUrl = async () => {
      if (!user) {
        return;
      }
      const userRole = await getUserRole(user?.id);

      if (userRole === "admin") {
        setDashboardUrl("/admin");
      } else if (userRole === "counselor") {
        setDashboardUrl("/counselor");
      } else {
        setDashboardUrl("/dashboard");
      }
    };

    if (isSignedIn) {
      getDashboardUrl();
    }
  }, [isSignedIn, user?.id]);
  useEffect(() => {
    const handleScroll = (e: Event) => {
      e.preventDefault();
      const target = e.target as HTMLAnchorElement;
      const id = target.getAttribute("href")?.slice(1);
      if (id) {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach((link) => {
      link.addEventListener("click", handleScroll);
    });

    return () => {
      links.forEach((link) => {
        link.removeEventListener("click", handleScroll);
      });
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 py-4 px-4 md:px-6 lg:px-8 border-b">
      <div className="container mx-auto flex justify-between items-center gap-8">
        <Link
          href="/"
          className="flex gap-3 items-center text-2xl font-bold text-primary"
        >
          <GraduationCap className="h-6 w-6" /> EduBot AI
        </Link>
        <nav className="hidden md:flex space-x-4">
          <Link
            href="#features"
            className="text-muted-foreground hover:text-primary"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-muted-foreground hover:text-primary"
          >
            How It Works
          </Link>
          <Link
            href="#testimonials"
            className="text-muted-foreground hover:text-primary"
          >
            Testimonials
          </Link>
        </nav>
        {isSignedIn && dashboardUrl ? (
          <nav className="flex gap-4 sm:gap-6">
            <Link href={dashboardUrl}>
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <UserButton />
          </nav>
        ) : (
          <nav className="flex gap-4 sm:gap-6">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
