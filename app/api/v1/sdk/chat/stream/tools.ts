import {
    JSONValue,
    StreamData,
    streamText,
    tool,
    ToolExecutionOptions,
  } from "ai";
  import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { z } from "zod";
import { users } from "@/lib/db/schema";
import {
    createDynamicRecommendationsTool,
    renderProgramRecommendationsUI,
  } from "./chat-utils";

export  const collectUserInfoTool = tool({
    description: "Collect initial user information when starting the chat",
    parameters: z.object({
      name: z.string(),
      email: z.string().email(),
    }),
    execute: async ({ name, email }) => {
      // Save or update user info in DB
      try {
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, email),
        });
  
        if (!existingUser) {
          await db.insert(users).values({
            fullName: name,
            email: email,
            role: "student",
          });
        }
  
        return {
          success: true,
          ui: {
            type: "welcomeMessage",
            message: `Welcome ${name}! I'll be your educational counseling assistant. How can I help you today?`,
          },
        };
      } catch (error) {
        console.error("Error saving user info:", error);
        return {
          success: false,
          error: "Failed to save user information",
        };
      }
    },
  });
export function renderClassificationUI(category: string) {
    switch (category) {
      case "RECOMMENDATION_REQUEST":
        return {
          type: "form",
          fields: [
            {
              type: "text",
              label: "Current Education Level",
              required: true,
              id: "education",
            },
            {
              type: "multiselect",
              label: "Preferred Countries",
              required: true,
              id: "countries",
              options: ["USA", "UK", "Canada", "Australia"],
            },
            {
              type: "number",
              required: false,
              label: "Budget Range (USD)",
              id: "budget",
            },
          ],
        };
      case "HUMAN_COUNSELOR":
      case "HUMAN_COUNSELOR":
        return {
          type: "form",
          fields: [
            {
              type: "text",
              label: "Full Name",
              id: "name",
              required: true,
            },
            {
              type: "email",
              label: "Email Address",
              id: "email",
              required: true,
            },
            {
              type: "tel",
              label: "Phone Number",
              id: "phone",
              required: true,
            },
            {
              type: "select",
              label: "Preferred Time to Call",
              id: "preferredTime",
              required: true,
              options: [
                "Morning (9 AM - 12 PM)",
                "Afternoon (12 PM - 5 PM)",
                "Evening (5 PM - 8 PM)",
              ],
            },
            {
              type: "multiselect",
              label: "Target Countries",
              id: "targetCountries",
              required: true,
              options: ["USA", "UK", "Canada", "Australia", "Other"],
            },
            {
              type: "textarea",
              label: "Academic Interests",
              id: "academicInterests",
              required: false,
              placeholder: "Tell us about your academic interests and goals",
            },
            {
              type: "select",
              label: "Urgency",
              id: "urgency",
              required: false,
              options: ["high", "medium", "low"],
            },
          ],
        };
      default:
        return null;
    }
  }

// Tool for classifying user queries
export const classifyQueryTool = tool({
    description: "Classify the user query into predefined categories",
    parameters: z.object({
      category: z.enum([
        "GENERAL_QUESTION",
        "SPECIFIC_PROGRAM",
        "RECOMMENDATION_REQUEST",
        "HUMAN_COUNSELOR",
        "IRRELEVANT",
      ]),
      confidence: z.number().min(0).max(1),
      reasoning: z.string(),
    }),
    execute: async ({ category, confidence, reasoning }) => {
      return {
        category,
        confidence,
        reasoning,
        ui: renderClassificationUI(category), // Return UI based on classification
      };
    },
  });
  
  export const humanCounselorTool = tool({
    description:
      "Collect and save information for human counselor contact request",
    parameters: z.object({
      name: z.string(),
      email: z.string().email(),
      phone: z.string(),
      preferredTime: z.string(),
      academicInterests: z.string().optional(),
      targetCountries: z.array(z.string()).optional(),
      urgency: z.enum(["high", "medium", "low"]).optional(),
    }),
    execute: async (params) => {
      try {
        // Get or create user
        let user = await db.query.users.findFirst({
          where: eq(users.email, params.email),
        });
  
        if (!user) {
          const [newUser] = await db
            .insert(users)
            .values({
              fullName: params.name,
              email: params.email,
              role: "student",
            })
            .returning();
          user = newUser;
        }
  
        // Save counselor request
        // await db.insert(counselorRequests).values({
        //   userId: user.id,
        //   phoneNumber: params.phone,
        //   preferredTime: params.preferredTime,
        //   academicInterests: params.academicInterests || '',
        //   targetCountries: params.targetCountries || [],
        //   urgency: params.urgency || 'medium',
        //   status: 'pending'
        // });
  
        return {
          success: true,
          ui: {
            type: "confirmation",
            message: `Thank you ${params.name}! A counselor will contact you at ${params.preferredTime} on ${params.phone}.`,
            details:
              "We've received your request and will match you with the most suitable counselor for your needs.",
          },
        };
      } catch (error) {
        console.error("Error saving counselor request:", error);
        return {
          success: false,
          error: "Failed to process counselor request",
        };
      }
    },
  });
  
  // Tool for searching vector DB for general questions
  export const searchVectorDBTool = tool({
    description:
      "Search vector database for relevant information about general questions",
    parameters: z.object({
      query: z.string(),
    }),
    execute: async ({ query }) => {
      // TODO: Implement actual vector DB search
      return {
        context: "Sample vector DB results for: " + query,
      };
    },
  });
  
  // Tool for searching programs database
  export const searchProgramsTool = tool({
    description: "Search programs database for specific program information",
    parameters: z.object({
      programName: z.string(),
    }),
    execute: async ({ programName }) => {
      // TODO: Implement actual DB query
      return {
        program: "Sample program details for: " + programName,
      };
    },
  });
  
  // Tool for getting program recommendations
  export const getRecommendationsTool = tool({
    description:
      "Show program recommendations based on student profile and preferences",
    parameters: z.object({
      summary: z.string(),
    }),
    execute: async ({ summary }) => {
      const programs = [
        {
          title: "Sample Pgm",
          university: "Sample Uni",
          details: "Sample details",
          match: 0.8,
          id: 1,
        },
      ];
      const totalResults = programs.length;
  
      return {
        programs,
        totalResults,
        ui: renderProgramRecommendationsUI(programs),
      };
    },
  });