'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeSettings } from "./components/theme-settings";
import { LogoSettings } from "./components/logo-settings";

export default function SettingsPage() {

  // if (!isLoaded) {
  //   return (
  //     <div className="container mx-auto py-10">
  //       <div className="animate-pulse space-y-4">
  //         <div className="h-8 bg-gray-200 rounded w-1/4"></div>
  //         <div className="h-64 bg-gray-200 rounded"></div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Organization Settings</h1>
        <p className="text-muted-foreground">
          Manage your organization&apos;s appearance and branding
        </p>
      </div>

      <Tabs defaultValue="theme" className="space-y-4">
        <TabsList>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="logo">Logo</TabsTrigger>
        </TabsList>
        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>
                Customize your organization&apos;s colors and appearance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ThemeSettings />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="logo">
          <Card>
            <CardHeader>
              <CardTitle>Logo Settings</CardTitle>
              <CardDescription>
                Upload and manage your organization&apos;s logo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LogoSettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
