'use server';

import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { BuilderSchema } from "@/types/organization";
import { eq } from "drizzle-orm";

export async function getOrganizationBySubdomain(subdomain: string) {
  try {
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.subdomain, subdomain),
    });

    if (!org) {
      throw new Error("Organization not found");
    }

    return org;
  } catch (error) {
    console.error("Error fetching organization:", error);
    throw error;
  }
}


export async function saveOrganizationSchema(
  organizationId: string,
  schema: BuilderSchema
) {
  // Validate schema structure
  validateSchema(schema);

  // Save to database
  await db
    .update(organizations)
    .set({
      programSchema: schema,
      updatedAt: new Date()
    })
    .where(eq(organizations.id, organizationId));

  // Generate and save template file for bulk uploads
  await generateTemplateFile(organizationId, schema);
}

function validateSchema(schema: Record<string, any>) {
  // Ensure all required fields are present
  if (!schema.sections || !Array.isArray(schema.sections)) {
    throw new Error('Schema must contain sections array');
  }

  // Validate each section
  schema.sections.forEach((section: any) => {
    if (!section.name || !section.fields) {
      throw new Error('Each section must have a name and fields');
    }

    // Validate fields
    section.fields.forEach((field: any) => {
      if (!field.name || !field.type) {
        throw new Error('Each field must have a name and type');
      }

      // Validate field type
      if (!['text', 'number', 'boolean', 'array', 'object', 'enum'].includes(field.type)) {
        throw new Error(`Invalid field type: ${field.type}`);
      }

      // Additional validation for specific types
      if (field.type === 'enum' && (!field.options || !Array.isArray(field.options))) {
        throw new Error('Enum fields must have options array');
      }
    });
  });
}

async function generateTemplateFile(organizationId: string, schema: Record<string, any>) {
  // Generate Excel/CSV template based on schema
  // Implementation details for template generation
}