"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeSettings } from "./components/theme-settings";
import { LogoSettings } from "./components/logo-settings";
import { OrganizationDetails } from "./components/organization-details";
import { ApiKeySettings } from "./components/api-key-settings";
import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";

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
    <DashboardShell>
      <DashboardHeader
        heading="Settings"
        text="Manage your organization's appearance and branding"
      />
      <div className="space-y-4">
        <Tabs defaultValue="organization" className="space-y-4">
          <TabsList>
            <TabsTrigger value="organization">Organization</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="logo">Logo</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          </TabsList>
          <TabsContent value="organization">
            <Card>
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
                <CardDescription>
                  Manage your organization&apos;s basic information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrganizationDetails />
              </CardContent>
            </Card>
          </TabsContent>
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
          <TabsContent value="api-keys">
            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                  Manage API keys for accessing your organization&apos;s services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ApiKeySettings />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}
