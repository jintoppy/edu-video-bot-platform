import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { programs, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';

function renderClassificationUI(category: string) {
  switch(category) {
    case 'RECOMMENDATION_REQUEST':
      return {
        type: 'form',
        fields: [
          {
            type: 'text',
            label: 'Current Education Level',
            id: 'education'
          },
          {
            type: 'multiselect',
            label: 'Preferred Countries',
            id: 'countries',
            options: ['USA', 'UK', 'Canada', 'Australia']
          },
          {
            type: 'number',
            label: 'Budget Range (USD)',
            id: 'budget'
          }
        ]
      };
    case 'HUMAN_COUNSELOR':
      case 'HUMAN_COUNSELOR':
      return {
        type: 'form',
        fields: [
          {
            type: 'text',
            label: 'Full Name',
            id: 'name',
            required: true
          },
          {
            type: 'email',
            label: 'Email Address',
            id: 'email',
            required: true
          },
          {
            type: 'tel',
            label: 'Phone Number',
            id: 'phone',
            required: true
          },
          {
            type: 'select',
            label: 'Preferred Time to Call',
            id: 'preferredTime',
            required: true,
            options: [
              'Morning (9 AM - 12 PM)',
              'Afternoon (12 PM - 5 PM)',
              'Evening (5 PM - 8 PM)'
            ]
          },
          {
            type: 'multiselect',
            label: 'Target Countries',
            id: 'targetCountries',
            options: ['USA', 'UK', 'Canada', 'Australia', 'Other']
          },
          {
            type: 'textarea',
            label: 'Academic Interests',
            id: 'academicInterests',
            placeholder: 'Tell us about your academic interests and goals'
          },
          {
            type: 'select',
            label: 'Urgency',
            id: 'urgency',
            options: ['high', 'medium', 'low']
          }
        ]
      };
    default:
      return null;
  }
}

// Helper function to render recommendations UI
function renderProgramRecommendationsUI(programs: any[]) {
  return {
    type: 'programList',
    programs: programs.map(p => ({
      title: p.name,
      university: p.university,
      details: p.details,
      matchScore: p.match,
      cta: {
        label: 'Learn More',
        action: 'viewProgram',
        id: p.id
      }
    }))
  };
}

const collectUserInfoTool = tool({
  description: 'Collect initial user information when starting the chat',
  parameters: z.object({
    name: z.string(),
    email: z.string().email(),
  }),
  execute: async ({ name, email }) => {
    // Save or update user info in DB
    try {
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, email)
      });

      if (!existingUser) {
        await db.insert(users).values({
          fullName: name,
          email: email,
          role: 'student',
        });
      }

      return {
        success: true,
        ui: {
          type: 'welcomeMessage',
          message: `Welcome ${name}! I'll be your educational counseling assistant. How can I help you today?`
        }
      };
    } catch (error) {
      console.error('Error saving user info:', error);
      return {
        success: false,
        error: 'Failed to save user information'
      };
    }
  }
});

// Tool for classifying user queries
const classifyQueryTool = tool({
  description: 'Classify the user query into predefined categories',
  parameters: z.object({
    category: z.enum([
      'GENERAL_QUESTION',
      'SPECIFIC_PROGRAM',
      'RECOMMENDATION_REQUEST', 
      'HUMAN_COUNSELOR',
      'IRRELEVANT'
    ]),
    confidence: z.number().min(0).max(1),
    reasoning: z.string()
  }),
  execute: async ({ category, confidence, reasoning }) => {
    return {
      category,
      confidence,
      reasoning,
      ui: renderClassificationUI(category) // Return UI based on classification
    };
  }
});

const humanCounselorTool = tool({
  description: 'Collect and save information for human counselor contact request',
  parameters: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    preferredTime: z.string(),
    academicInterests: z.string().optional(),
    targetCountries: z.array(z.string()).optional(),
    urgency: z.enum(['high', 'medium', 'low']).optional(),
  }),
  execute: async (params) => {
    try {
      // Get or create user
      let user = await db.query.users.findFirst({
        where: eq(users.email, params.email)
      });

      if (!user) {
        const [newUser] = await db.insert(users).values({
          fullName: params.name,
          email: params.email,
          role: 'student',
        }).returning();
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
          type: 'confirmation',
          message: `Thank you ${params.name}! A counselor will contact you at ${params.preferredTime} on ${params.phone}.`,
          details: "We've received your request and will match you with the most suitable counselor for your needs."
        }
      };
    } catch (error) {
      console.error('Error saving counselor request:', error);
      return {
        success: false,
        error: 'Failed to process counselor request'
      };
    }
  }
});

// Tool for searching vector DB for general questions
const searchVectorDBTool = tool({
  description: 'Search vector database for relevant information about general questions',
  parameters: z.object({
    query: z.string()
  }),
  execute: async ({ query }) => {
    // TODO: Implement actual vector DB search
    return {
      context: "Sample vector DB results for: " + query
    };
  }
});

// Tool for searching programs database
const searchProgramsTool = tool({
  description: 'Search programs database for specific program information',
  parameters: z.object({
    programName: z.string()
  }), 
  execute: async ({ programName }) => {
    // TODO: Implement actual DB query
    return {
      program: "Sample program details for: " + programName
    };
  }
});

// Tool for getting program recommendations
const getRecommendationsTool = tool({
  description: 'Show program recommendations based on student profile and preferences',
  parameters: z.object({
    programs: z.array(z.object({
      name: z.string(),
      university: z.string(),
      details: z.string(),
      match: z.number()
    })),
    totalResults: z.number()
  }),
  execute: async ({ programs, totalResults }) => {
    return {
      programs,
      totalResults,
      ui: renderProgramRecommendationsUI(programs)
    };
  }
});

// System prompt to guide the model's behavior
const SYSTEM_PROMPT = `You are an educational counseling assistant. First, collect user's basic information if not already provided.

Always start with:
1. If this is the first message, use the collectUserInfo tool to get user's name and email
2. After collecting info, proceed with normal conversation

For regular conversations:
1. Classify user queries into appropriate categories
2. Provide helpful responses based on the query type
3. Collect necessary information when needed
4. Be polite and professional in all interactions

For counselor requests:
1. Explain that you'll collect some information to match them with the best counselor
2. Use the humanCounselor tool to collect all necessary details
3. Assure them about the follow-up process

For general questions, use provided context to give accurate information.
For specific programs, provide detailed program information.
For recommendations, gather student profile details before making suggestions.
For irrelevant queries, politely redirect to education-related topics.`;

export const maxDuration = 30; // Allow streaming responses up to 30 seconds

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4-turbo'),
    system: SYSTEM_PROMPT,
    messages,
    maxSteps: 5,
    tools: {
      collectUserInfo: collectUserInfoTool,
      humanCounselor: humanCounselorTool,
      classifyQuery: classifyQueryTool,
      searchVectorDB: searchVectorDBTool,
      searchPrograms: searchProgramsTool,
      getRecommendations: getRecommendationsTool
    }
  });

  return result.toDataStreamResponse();
}