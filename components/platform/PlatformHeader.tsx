'use client';

import { Button } from "@/components/ui/button";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { useRouter } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { getUserRole } from "@/app/actions/user";
import { useEffect, useState } from "react";

const Header = () => {
  const router = useRouter();
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
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="w-full py-4 px-6 bg-white border-b fixed top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-2xl font-bold text-[#212529]">EduBot</div>
        
        <NavigationMenu>
          <NavigationMenuList className="hidden md:flex gap-8">
            <NavigationMenuItem>
              <NavigationMenuLink 
                className="text-[#212529]/80 hover:text-[#212529] cursor-pointer" 
                onClick={() => scrollToSection('features')}
              >
                Features
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink 
                className="text-[#212529]/80 hover:text-[#212529] cursor-pointer" 
                onClick={() => scrollToSection('how-it-works')}
              >
                How It Works
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink 
                className="text-[#212529]/80 hover:text-[#212529] cursor-pointer" 
                onClick={() => router.push('/pricing')}
              >
                Pricing
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {isSignedIn && dashboardUrl ? (
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
            <Button className="bg-[#ff611d] text-white hover:bg-[#ff611d]/90">
            Get Started
          </Button>
          </nav>
        )}

      </div>
    </header>
  );
};

export default Header;