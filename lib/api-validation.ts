// src/lib/api-validation.ts
import { db } from "@/lib/db";
import { apiKeys } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function validateApiKeyAndDomain(apiKey: string, origin: string | null) {
  try {
    // Simplified query without 'with' clause
    const keyDetails = await db.query.apiKeys.findFirst({
      where: eq(apiKeys.key, apiKey)
    });

    if (!keyDetails) {
      return { 
        isValid: false, 
        error: "Invalid API key",
        status: 401 
      };
    }

    if (!keyDetails.isActive) {
      return { 
        isValid: false, 
        error: "API key is inactive",
        status: 403 
      };
    }

    // If no origin, might be a server-to-server request
    if (!origin) {
      return { 
        isValid: true, 
        organizationId: keyDetails.organizationId 
      };
    }

    // Check if domain is allowed
    const allowedDomains = keyDetails.allowedDomains as string[];
    const isAllowedDomain = allowedDomains?.some(domain => {
      if (domain === '*') return true;
      if (domain.startsWith('*.')) {
        const wildCardDomain = domain.slice(2);
        return origin.endsWith(wildCardDomain);
      }
      return origin === domain;
    });

    if (!isAllowedDomain) {
      return { 
        isValid: false, 
        error: "Domain not allowed",
        status: 403 
      };
    }

    return { 
      isValid: true, 
      organizationId: keyDetails.organizationId,
      key: keyDetails 
    };
  } catch (error) {
    console.error('API key validation error:', error);
    return { 
      isValid: false, 
      error: "Internal server error",
      status: 500 
    };
  }
}