import { tool } from "ai";

import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { z } from "zod";
import {
  chatMessages,
  chatSessions,
  counselorAssignments,
  documentation,
  documentEmbeddings,
  users,
} from "@/lib/db/schema";
import {
  createDynamicRecommendationsTool,
  renderProgramRecommendationsUI,
} from "./chat-utils";
import { embeddings, loadVectorStore } from "@/lib/embedding";
import { se } from "date-fns/locale";

const sessionContext = new Map<
  string,
  {
    chatSessionId: string;
    userId: string | null;
    startTime: Date;
  }
>();

export const logChatMessage = async ({
  sessionId,
  message,
  messageType,
}: {
  sessionId: string;
  message: string;
  messageType: string;
}) => {
    try {
        console.log("inside logChatMessage", sessionId, message, messageType);
        const context = sessionContext.get(sessionId);
      
        if (!context) {
          const existingSession = await db.query.chatSessions.findFirst({
            where: eq(chatSessions.id, sessionId),
          });
          if (existingSession) {
            sessionContext.set(sessionId, {
              chatSessionId: existingSession.id,
              userId: null,
              startTime: new Date(),
            });
          }
        }
      
        if (context) {
          console.log("context", context);
          console.log('inserting chat message');
          const [insertedMessage] = await db.insert(chatMessages).values({
            sessionId: context.chatSessionId,
            userId: context.userId,
            messageType:
              messageType === "user_message" ? "user_message" : "bot_message",
            content: message,
          })
          .returning();
          console.log("Message logged successfully:", insertedMessage);
        }
    } catch (error) {
        console.log('error logging chat message', error);
    }
 
};

export const createCollectUserInfoTool = (uiChatSessionId: string) => {
  const collectUserInfoTool = tool({
    description: "Collect initial user information when starting the chat",
    parameters: z.object({
      name: z.string(),
      email: z.string().email(),
    }),
    execute: async ({ name, email }) => {
      // Save or update user info in DB
      try {
        let userId;
        const existingUser = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (!existingUser) {
          const [newUser] = await db
            .insert(users)
            .values({
              fullName: name,
              email: email,
              role: "student",
            })
            .returning();
          userId = newUser.id;
        } else {
          userId = existingUser.id;
        }

        const existingSession = await db.query.chatSessions.findFirst({
          where: eq(chatSessions.id, uiChatSessionId),
        });

        let session;
        if (existingSession) {
          // Update existing session with userId
          const [updatedSession] = await db
            .update(chatSessions)
            .set({
              studentId: userId,
              updatedAt: new Date(),
            })
            .where(eq(chatSessions.id, uiChatSessionId))
            .returning();

          session = updatedSession;
        } else {
          // Create new session
          const [newSession] = await db
            .insert(chatSessions)
            .values({
              id: uiChatSessionId, // Use the provided ID
              studentId: userId,
              communicationMode: "text_only",
              startTime: new Date(),
              category: "general_query",
              status: "active",
            })
            .returning();

          session = newSession;
        }

        sessionContext.set(uiChatSessionId, {
          chatSessionId: session.id,
          userId: userId,
          startTime: new Date(),
        });

        return {
          success: true,
          sessionId: session.id,
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
  return collectUserInfoTool;
};

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
export const createClassifyQueryTool = (uiChatSessionId: string) => {
  const classifyQueryTool = tool({
    description: `
        Classify the user query into predefined categories
          GENERAL_QUESTION: general questions about foreign education, visa related topics, services provided, question about the consultancy, any similar education related toopics. For eg. if user asks "who is your ceo", user asking about the consultancy. So, it comes under GENERAL_QUESTION. 
          SPECIFIC_PROGRAM: if user is asking about a particular education program
          RECOMMENDATION_REQUEST: if user asks to give some program recommendation based on their background, or asks about if user is elibile for a program
          HUMAN_COUNSELOR: if user asks to connect with human counselor
          IRRELEVANT: if user asks something which does not fit into above categories
        `,
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
      const context = sessionContext.get(uiChatSessionId);
      if (context) {
        // Update chat session category
        let categoryTxt: any = "general_query";
        switch (category) {
          case "GENERAL_QUESTION":
            categoryTxt = "general_query";
            break;
          case "SPECIFIC_PROGRAM":
            categoryTxt = "program_review";
            break;
          case "RECOMMENDATION_REQUEST":
            categoryTxt = "recommendation_request";
            break;
          case "HUMAN_COUNSELOR":
            categoryTxt = "follow_up_request";
            break;
          default:
            categoryTxt = "general_query";
            break;
        }
        await db
          .update(chatSessions)
          .set({
            category: categoryTxt,
            updatedAt: new Date(),
          })
          .where(eq(chatSessions.id, context.chatSessionId));
      }
      return {
        category,
        confidence,
        reasoning,
        ui: renderClassificationUI(category), // Return UI based on classification
      };
    },
  });
  return classifyQueryTool;
};

export const createHumanCounselorTool = (uiChatSessionId: string) => {
    const humanCounselorTool = tool({
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
      
            const [assignment] = await db
                .insert(counselorAssignments)
                .values({
                  studentId: user.id,
                  conversationId: uiChatSessionId,
                  status: "open",
                  priority: params.urgency || "medium",
                  metadata: {
                    preferredTime: params.preferredTime,
                    phone: params.phone,
                    academicInterests: params.academicInterests,
                    targetCountries: params.targetCountries,
                  },
                  notes: `Contact requested for ${params.preferredTime}. 
                         Academic Interests: ${params.academicInterests || 'Not specified'}
                         Target Countries: ${params.targetCountries?.join(', ') || 'Not specified'}`
                })
                .returning();
      
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

      return humanCounselorTool;
}



const vectorStore = await loadVectorStore();
// Tool for searching vector DB for general questions
export const searchVectorDBTool = tool({
  description:
    "Search vector database for relevant information about general questions",
  parameters: z.object({
    query: z.string(),
  }),
  execute: async ({ query }) => {
    try {
      console.log("query", query);
      // Generate embedding for the query
      const queryEmbedding = await embeddings.embedQuery(query);
      if (!queryEmbedding || queryEmbedding.length !== 1536) {
        throw new Error("Invalid query embedding generated");
      }

      const vectorResults = await db.execute(
        sql`
          WITH vector_matches AS (
            SELECT 
              de.id,
              de.document_id,
              de.embedding <=> ${sql.param(
                JSON.stringify(queryEmbedding)
              )}::vector AS similarity
            FROM ${documentEmbeddings} de
            ORDER BY similarity ASC
            LIMIT 3
          )
          SELECT 
            vm.*,
            d.title,
            d.content
          FROM vector_matches vm
          JOIN ${documentation} d ON d.id = vm.document_id;
        `
      );

      if (!vectorResults.length) {
        console.log("No matches found - checking vector normalization");
        // Check if vectors are normalized
        const sampleVector = await db.query.documentEmbeddings.findFirst();
        if (sampleVector) {
          const magnitude = Math.sqrt(
            sampleVector.embedding.reduce((sum, val) => sum + val * val, 0)
          );
          console.log("Sample vector magnitude:", magnitude);
        }
      }

      const results = vectorResults.map((row) => ({
        documentId: row.document_id,
        title: row.title,
        content: row.content,
        similarity: row.similarity,
      }));

      if (results.length === 0) {
        return "No matching documents found";
      }

      const context = results
        .map(
          (result) => `
Title: ${result.title}
Content: ${result.content}
Similarity: ${result.similarity}
---`
        )
        .join("\n");

      return {
        context,
        results,
      };
    } catch (error) {
      console.error("Vector search error:", error);
      throw new Error("Failed to perform vector search");
    }
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
