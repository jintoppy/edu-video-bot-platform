"use client";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { useRouter } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Menu } from "lucide-react";
import { getUserRole } from "@/app/actions/user";
import { useEffect, useState } from "react";
import Image from "next/image";

const Header = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { isSignedIn, user } = useUser();
  const [dashboardUrl, setDashboardUrl] = useState("");

  useEffect(() => {
    const getDashboardUrl = async () => {
      if (!user) {
        return;
      }
      const userRole = await getUserRole(user?.id);

      if (userRole === "org:admin") {
        setDashboardUrl("/admin");
      } else if (userRole === "org:member") {
        setDashboardUrl("/counselor");
      } else {
        setDashboardUrl("/dashboard");
      }
    };

    if (isSignedIn) {
      getDashboardUrl();
    }
  }, [isSignedIn, user?.id]);

  const scrollToSection = (sectionId: string) => {
    const section = document.querySelector(sectionId);
    section?.scrollIntoView({ behavior: "smooth" });
    setIsOpen(false);
  };

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">
            <Link href="/">            
              <Image
                src="/bots4ed-logo.png"
                width={200}
                height={50}
                alt="Bot4Edu Logo"
                />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("#features")}
              className="text-gray-600 hover:text-primary transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("#benefits")}
              className="text-gray-600 hover:text-primary transition-colors"
            >
              Benefits
            </button>
            <button
              onClick={() => scrollToSection("#how-it-works")}
              className="text-gray-600 hover:text-primary transition-colors"
            >
              How It Works
            </button>
            <Button
              variant="default"
              className="bg-primary hover:bg-primary/90"
              onClick={() => scrollToSection("#contact-form")}
            >
              Get Started
            </Button>
            {/* {isSignedIn && dashboardUrl ? (
              <nav className="flex items-center gap-4">
                <Link href={dashboardUrl}>
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <UserButton />
              </nav>
            ) : (
              <nav className="flex items-center gap-4">
                <Link href="/sign-in">
                  <Button variant="ghost">Sign In</Button>
                </Link>
              </nav>
            )} */}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pt-4 pb-2">
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => scrollToSection("#features")}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection("#benefits")}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Benefits
              </button>
              <button
                onClick={() => scrollToSection("#how-it-works")}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                How It Works
              </button>
              <Button
                variant="default"
                className="bg-primary hover:bg-primary/90 w-full"
                onClick={() => scrollToSection("#contact-form")}
              >
                Get Started
              </Button>
              {/* {isSignedIn && dashboardUrl ? (
                <Link href={dashboardUrl}>
                  <Button variant="ghost">Dashboard</Button>
                </Link>
              ) : (
                <Link href="/sign-in">
                  <Button variant="ghost">Sign In</Button>
                </Link>
              )} */}
            </div>
          </div>
        )}
      </div>
    </nav>
  );

};

export default Header;
