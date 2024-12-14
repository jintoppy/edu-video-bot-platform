// providers/organization-provider.tsx
"use client";

import { Organization } from "@/lib/db/schema";
import { createContext, useContext, ReactNode } from "react";

interface OrganizationContextType {
  organization: Organization;
  subdomain: string;  
  settings: {
    logo: string;
    theme: {
      primaryColor: string;
      secondaryColor: string;
      accentColor: string;
      fontFamily: string;
    };
  };
}

const OrganizationContext = createContext<OrganizationContextType | null>(null);

interface OrganizationProviderProps {
  children: ReactNode;
  organization: Organization;
}

export function OrganizationProvider({ 
  children, 
  organization,
  settings 
}: OrganizationProviderProps & { settings: any }) {
  return (
    <OrganizationContext.Provider
      value={{
        organization,
        subdomain: organization.subdomain,
        settings
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  
  if (!context) {
    throw new Error("useOrganization must be used within an OrganizationProvider");
  }
  
  return context;
}
