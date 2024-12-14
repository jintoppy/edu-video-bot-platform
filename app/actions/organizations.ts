"use server";

import { db } from "@/lib/db";
import { Organization, organizationInvitations, organizations, users } from "@/lib/db/schema";
import { clerkClient } from "@/lib/clerk";
import { revalidatePath } from "next/cache";
import type { User } from "@clerk/backend";
import { currentUser } from "@clerk/nextjs/server"; 
import { eq, or } from "drizzle-orm";
import { BuilderSchema, EligibilityField, FieldType, GetSchemaResponse, SchemaField, SchemaSection } from "@/types/organization";

function ensureFieldType(type: string): FieldType {
  const validTypes = ['text', 'number', 'boolean', 'array', 'object', 'enum'] as const;
  if (validTypes.includes(type as FieldType)) {
    return type as FieldType;
  }
  return 'text'; // Default to text if invalid type
}

function cleanSchemaForDB(schema: BuilderSchema): BuilderSchema {
  // Create a clean version of sections
  const cleanSections = schema.sections.map(section => ({
    name: section.name,
    isExpanded: false, // Reset UI state
    fields: section.fields.map(field => ({
      name: field.name,
      type: field.type,
      required: field.required,
      options: field.options,
      fields: field.fields,
      arrayType: field.arrayType,
      label: field.label,
      section: section.name
    }))
  }));

  // Create a clean version of eligibility criteria if it exists
  const cleanEligibilityCriteria = schema.eligibilityCriteria ? {
    isExpanded: false, // Reset UI state
    fields: schema.eligibilityCriteria.fields.map(field => ({
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required,
      validation: field.validation,
      operator: field.operator
    }))
  } : undefined;

  return {
    sections: cleanSections,
    eligibilityCriteria: cleanEligibilityCriteria
  };
}

function convertBuilderToFlatSchema(builderSchema: BuilderSchema): Record<string, SchemaField> {
  return builderSchema.sections.reduce((acc, section) => {
    const sectionFields = section.fields.reduce((fieldAcc, field) => {
      fieldAcc[field.name] = {
        ...field,
        section: section.name
      };
      return fieldAcc;
    }, {} as Record<string, SchemaField>);

    return {
      sections: builderSchema.sections.map(section => ({
        name: section.name,
        fields: section.fields.reduce((fieldAcc, field) => {
          fieldAcc[field.name] = {
            ...field,
            section: section.name
          };
          return fieldAcc;
        }, {} as Record<string, SchemaField>),
        isExpanded: false // Reset UI state
      })),
      eligibilityCriteria: builderSchema.eligibilityCriteria ? {
        fields: builderSchema.eligibilityCriteria.fields.reduce((fieldAcc, field) => {
          fieldAcc[field.name] = {
            ...field
          };
          return fieldAcc;
        }, {} as Record<string, EligibilityField>),
        isExpanded: false // Reset UI state
      } : undefined
    };

  }, {});
}

function convertFlatToBuilderSchema(flatSchema: Record<string, SchemaField>): BuilderSchema {
  const sectionMap = new Map<string, SchemaSection>();

  Object.entries(flatSchema).forEach(([fieldName, field]) => {
    const sectionName = field.section || 'Other';
    
    if (!sectionMap.has(sectionName)) {
      sectionMap.set(sectionName, {
        name: sectionName,
        isExpanded: true,
        fields: []
      });
    }

    const section = sectionMap.get(sectionName)!;
    const { section: _, ...fieldWithoutSection } = field;
    section.fields.push({
      ...fieldWithoutSection,
      name: fieldName
    });
  });

  return {
    sections: Array.from(sectionMap.values())
  };
}

interface CreateOrganizationInput {
  name: string;
  subdomain: string;
  adminEmail: string;
  adminName: string;
}

export async function createOrganization(input: CreateOrganizationInput) {
  try {
    const user = await currentUser();

    if(!user){
        return;
    }

    // 2. Create organization in your database
    const [org] = await db
      .insert(organizations)
      .values({
        name: input.name,
        subdomain: input.subdomain,
        email: input.adminEmail,
        status: "inactive",
      })
      .returning();

    console.log('org', org);

    // 1. Create organization in Clerk
    const clerkOrg = await clerkClient.organizations.createOrganization({
      name: input.name,
      createdBy: user.id,
      slug: input.subdomain,
      // You can add more metadata as needed
      privateMetadata: {
        createdAt: new Date().toISOString(),
        orgId: org.id,
        adminEmail: input.adminEmail,
        adminName: input.adminName
      },
    });

    console.log('clerkOrg', clerkOrg);
    
    // 3. Create user record in your database

    // 3. Create admin invitation in Clerk
    const invitation = await clerkClient.organizations.createOrganizationInvitation({
      organizationId: clerkOrg.id,
      inviterUserId: user.id,
      emailAddress: input.adminEmail,
      role: "org:admin",
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/org-onboarding`,
      publicMetadata: {
        createdAt: new Date().toISOString(),
        orgId: org.id,
        adminEmail: input.adminEmail,
        adminName: input.adminName
      }
    });

    console.log('invitation', invitation);

    // 4. Create invitation record in your database
    await db.insert(organizationInvitations).values({
      organizationId: org.id,
      email: input.adminEmail,
      role: "org:admin",
      status: "pending",
      clerkInvitationId: invitation.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    revalidatePath("/admin/organizations");
    
    return { success: true, organizationId: org.id };
  } catch (error) {
    console.error("Error creating organization:", error);
    throw new Error("Failed to create organization");
  }
}

interface SaveSchemaInput {
  organizationId: string;
  schema: {
    sections: {
      name: string;
      isExpanded: boolean;
      fields: {
        name: string;
        label: string;
        type: string;
        required: boolean;
      }[];
    }[];
  };
}

export async function saveOrganizationSchema(input: {
  organizationId: string;
  schema: BuilderSchema;
}) {
  try {
    const clerkOrg = await clerkClient.organizations.getOrganization({
      organizationId: input.organizationId,
    });
  
    const orgId = clerkOrg.privateMetadata.orgId as string;
  
    // Get organization record first
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, orgId),
    });

    if(!org){
      throw new Error("No org found");
    }
    const cleanedSchema = cleanSchemaForDB(input.schema);

    // Update the organization
    await db
      .update(organizations)
      .set({
        programSchema: cleanedSchema,
        updatedAt: new Date()
      })
      .where(eq(organizations.id, org.id));

    revalidatePath("/admin/organizations");
    return { success: true };
  } catch (error) {
    console.error("Error saving organization schema:", error);
    throw new Error("Failed to save organization schema");
  }
}

export async function getOrganizationSchema(clerkOrgId: string): Promise<GetSchemaResponse> {
  try {
    
    const clerkOrg = await clerkClient.organizations.getOrganization({
      organizationId: clerkOrgId,
    });
  
    const orgId = clerkOrg.privateMetadata.orgId as string;
  
    // Get organization record first
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, orgId),
    });
    console.log(org);

    if(!org){
      throw new Error("No org found");
    }

    if (!org.programSchema) {
      // Return default schema
      return {
        schema: {
          sections: [
            {
              name: 'Basic Information',
              isExpanded: true,
              fields: [
                { name: 'university', label: 'University', type: 'text', required: true }
              ]
            }
          ]
        },
        orgId: org.id         
      };
    }

    return {
      schema: org.programSchema as BuilderSchema,
      orgId: org.id
    };
  } catch (error) {
    console.error("Error fetching organization schema:", error);
    throw new Error("Failed to fetch organization schema");
  }
}

export async function getOrganizationByClerkOrgId(clerkOrgId: string): Promise<Organization> {
  try {
    const clerkOrg = await clerkClient.organizations.getOrganization({
      organizationId: clerkOrgId,
    });
  
    const orgId = clerkOrg.privateMetadata.orgId as string;
  
    // Get organization record first
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.id, orgId),
    });

    if(!org){
      throw new Error("No org found");
    }

    return org;

  } catch (error) {
    console.error("Error fetching organization schema:", error);
    throw new Error("Failed to fetch organization schema"); 
  }
  }