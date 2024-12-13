import { db } from "@/lib/db";
import { organizations, programs } from "@/lib/db/schema";
import { EligibilityField } from "@/types/organization";
import { ToolDefinition } from "@langchain/core/language_models/base";
import { tool } from "ai";
import { and, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { PgColumn } from "drizzle-orm/pg-core";
import { z } from "zod";

type ProgramColumns = typeof programs._.columns;

function checkEligibility(
  paramValue: any,
  criteriaValue: { value: any; operator: string }
): boolean {
  const { value, operator } = criteriaValue;

  switch (operator) {
    case "equals":
      return paramValue === value;
    case "greaterThan":
      return paramValue > value;
    case "lessThan":
      return paramValue < value;
    case "greaterThanOrEqual":
      return paramValue >= value;
    case "lessThanOrEqual":
      return paramValue <= value;
    default:
      return false;
  }
}

function getProgramColumn(columnName: string): PgColumn | undefined {
  return (programs._ as any).columns[columnName];
}

function createCondition(
  column: PgColumn | undefined,
  operator: EligibilityField["operator"],
  value: any
) {
  if (!column) {
    // If column doesn't exist, return a always-true condition
    return sql`TRUE`;
  }

  switch (operator) {
    case "equals":
      return eq(column as any, value);
    case "greaterThan":
      return gte(column as any, value);
    case "lessThan":
      return lte(column as any, value);
    case "greaterThanOrEqual":
      return gte(column as any, value);
    case "lessThanOrEqual":
      return lte(column as any, value);
    default:
      return sql`TRUE`;
  }
}

type EligibilityCriterion = {
  field: string;
  operator: "equals" | "gt" | "gte" | "lt" | "lte" | "in" | "between";
  value: any;
  unit?: string;
  displayName: string;
  inputType: "text" | "number" | "select" | "multiselect";
  options?: string[];
  zodType: "string" | "number" | "array" | "boolean";
};

// Helper function to render recommendations UI
export function renderProgramRecommendationsUI(programs: any[]) {
  return {
    type: "programList",
    programs: programs.map((p) => ({
      title: p.name,
      university: p.university,
      details: p.details,
      matchScore: p.match,
      cta: {
        label: "Learn More",
        action: "viewProgram",
        id: p.id,
      },
    })),
  };
}

function calculateMatchScore(
  program: Record<string, any>,
  params: Record<string, any>,
  fields: EligibilityField[]
): number {
  let matchScore = 0;
  let totalCriteria = fields.length;

  fields.forEach((field) => {
    const studentValue = params[field.name];
    const programValue = program[field.name];
    let isMatch = false;

    switch (field.operator) {
      case "equals":
        isMatch = studentValue === programValue;
        break;
      case "greaterThan":
      case "greaterThanOrEqual":
        isMatch = studentValue >= programValue;
        break;
      case "lessThan":
      case "lessThanOrEqual":
        isMatch = studentValue <= programValue;
        break;
      case "in":
        isMatch =
          Array.isArray(programValue) && programValue.includes(studentValue);
        break;
    }

    if (isMatch) matchScore++;
  });

  return (matchScore / totalCriteria) * 100;
}

export function createZodSchema(field: EligibilityField): z.ZodType {
  switch (field.type) {
    case "number":
      let schema = z.number();
      if (field.validation) {
        if (field.validation.min !== undefined)
          schema = schema.min(field.validation.min);
        if (field.validation.max !== undefined)
          schema = schema.max(field.validation.max);
      }
      return field.required ? schema : schema.optional();
    default:
      return field.required ? z.string() : z.string().optional();
  }
}

interface RecommendationResult {
  programs: Array<{
    id: string;
    name: string;
    match: number;
    [key: string]: any;
  }>;
  totalResults: number;
  ui: {
    type: string;
    programs: Array<{
      title: string;
      university: string;
      details: string;
      matchScore: number;
      cta: {
        label: string;
        action: string;
        id: string;
      };
    }>;
  };
}

export function createDynamicRecommendationsTool(orgId: string): Promise<any> {
  return new Promise(async (resolve) => {
    try {
      // Get organization schema
      const organization = await db.query.organizations.findFirst({
        where: eq(organizations.id, orgId),
        columns: {
          programSchema: true,
        },
      });

      console.log("organization", organization);

      if (!organization?.programSchema?.eligibilityCriteria?.fields) {
        console.error("No eligibility criteria found");
        resolve(null);
        return;
      }

      const eligibilityFields =
        organization.programSchema.eligibilityCriteria.fields;

      console.log("eligibilityFields", eligibilityFields);

      // Create dynamic parameter schema
      const parameterSchema: Record<string, z.ZodType> = {};
      eligibilityFields.forEach((field) => {
        parameterSchema[field.name] = createZodSchema(field);
      });

      console.log("parameterSchema", parameterSchema);

      // Create the dynamic tool
      const dynamicTool = tool({
        description:
          "Get program recommendations based on eligibility criteria",
        parameters: z.object(parameterSchema),
        execute: async (params) => {
          try {
            // Build query conditions
            console.log("params", params);
            const allPrograms = await db.query.programs.findMany({
              where: eq(programs.organizationId, orgId),
              orderBy: (programs, { desc }) => [desc(programs.createdAt)],
            });

            // Filter programs based on eligibility criteria
            const matchedPrograms = allPrograms.filter((program) => {
              // Get program's eligibility criteria
              const programEligibility = program.eligibility as Record<
                string,
                { value: any; operator: string }
              >;

              if(!programEligibility){
                return true;
              }

              // Check if program meets all criteria
              return Object.entries(params).every(([fieldName, paramValue]) => {
                const criteriaField = programEligibility[fieldName];
                if (!criteriaField) return true; // If program doesn't specify this criteria, consider it matched

                return checkEligibility(paramValue, criteriaField);
              });
            });

            console.log("matchedPrograms", matchedPrograms);

            // Process programs with match scores
            const processedPrograms = matchedPrograms.map((program) => {
              const programEligibility = program.eligibility as Record<
                string,
                { value: any; operator: string }
              >;
              let matchScore = 0;
              let totalCriteria = 0;

              if(!programEligibility){
                return {
                    ...program,
                    match: 10, // adding a default match score for programs without eligibility
                  };
              }

              // Calculate match score
              Object.entries(params).forEach(([fieldName, paramValue]) => {
                const criteriaField = programEligibility[fieldName];
                if (criteriaField) {
                  totalCriteria++;
                  if (checkEligibility(paramValue, criteriaField)) {
                    matchScore++;
                  }
                }
              });

              return {
                ...program,
                match:
                  totalCriteria > 0 ? (matchScore / totalCriteria) * 100 : 100,
              };
            });

            console.log("processedPrograms", processedPrograms);

            // Sort by match score
            const sortedPrograms = processedPrograms.sort(
              (a, b) => b.match - a.match
            );

            return {
              programs: sortedPrograms,
              totalResults: sortedPrograms.length,
              ui: renderProgramRecommendationsUI(sortedPrograms),
            };
          } catch (error) {
            console.error("Error getting recommendations:", error);
            return {
              programs: [],
              totalResults: 0,
              ui: renderProgramRecommendationsUI([]),
            };
          }
        },
      });

      resolve(dynamicTool);
    } catch (error) {
      console.error("Error creating dynamic tool:", error);
      resolve(null);
    }
  });
}
