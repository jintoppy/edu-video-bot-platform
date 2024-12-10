import { openai } from '@ai-sdk/openai';
import { JSONValue, StreamData, streamText, tool, ToolExecutionOptions } from 'ai';
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
            required: true,
            id: 'education'
          },
          {
            type: 'multiselect',
            label: 'Preferred Countries',
            required: true,
            id: 'countries',
            options: ['USA', 'UK', 'Canada', 'Australia']
          },
          {
            type: 'number',
            required: false,
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
            required: true,
            options: ['USA', 'UK', 'Canada', 'Australia', 'Other']
          },
          {
            type: 'textarea',
            label: 'Academic Interests',
            id: 'academicInterests',
            required: false,
            placeholder: 'Tell us about your academic interests and goals'
          },
          {
            type: 'select',
            label: 'Urgency',
            id: 'urgency',
            required: false,
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
    summary: z.string()
  }),
  execute: async ({ summary }) => {
    console.log(summary);
    const programs = [{title: 'Sample Pgm', university: 'Sample Uni', details: 'Sample details', match: 0.8, id: 1}];
    const totalResults = programs.length;

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

type StreamResponse = {
  hls_url: string;
  mp4_url: string;
}

async function generateVideo(text: string): Promise<StreamResponse | null> {
  const options = {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      ttsAPIKey: process.env.TTS_API_KEY,
      simliAPIKey: process.env.SIMLI_API_KEY,
      faceId: process.env.FACE_ID,
      user_id: "default",
      requestBody: {
        audioProvider: "elevenlabs",
        text: text,
        voice: "default",
        quality: "medium",
        speed: 1,
        sample_rate: 44100,
        voice_engine: "standard",
        output_format: "mp3",
        emotion: "neutral",
        voice_guidance: 1,
        style_guidance: 1,
        text_guidance: 1
      }
    })
  };

  try {
    const response  = await fetch('https://api.simli.ai/textToVideoStream', options);
    const data: StreamResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating video:', error);
    return null;
  }
}

export async function POST(req: Request) {
  const { messages } = await req.json();

  const streamingData = new StreamData();
  let currentMessage = '';

  const result = streamText({
    onTextContent: (text: string) => {
      currentMessage += text;
    },
    model: openai('gpt-4-turbo'),
    system: SYSTEM_PROMPT,
    messages,
    maxSteps: 5,
    tools: {
      collectUserInfo: {
        ...collectUserInfoTool,
        execute: async (params, options) => {
          const response = await collectUserInfoTool.execute(params, options);
          // Append UI data to stream if present
          if (response.ui) {
            streamingData.append({
              type: 'ui',
              content: response.ui
            });
          }
          return response;
        }
      },
      humanCounselor: {
        ...humanCounselorTool,
        execute: async (params, options: ToolExecutionOptions) => {
          const response = await humanCounselorTool.execute(params, options);
          if (response.ui) {
            streamingData.append({
              type: 'ui',
              content: response.ui,
              toolCallId: options.toolCallId
            });
          }
          return response;
        }
      },
      classifyQuery: {
        ...classifyQueryTool,
        execute: async (params, options: ToolExecutionOptions) => {
          const response = await classifyQueryTool.execute(params, options);
          if (response.ui) {
            // Transform fields to ensure JSON compatibility
            const uiContent = {
              type: response.ui.type,
              fields: response.ui.fields.map(field => ({
                ...field,
                // Ensure optional properties are always defined with null instead of undefined
                options: field.options || null,
                required: field.required || false,
                placeholder: field.placeholder || null
              }))
            };
      
            streamingData.append({
              type: 'ui',
              content: uiContent as JSONValue,
              toolCallId: options.toolCallId
            });
          }
          return response;
        }
      },
      searchVectorDB: searchVectorDBTool,
      searchPrograms: searchProgramsTool,
      getRecommendations: {
        ...getRecommendationsTool,
        execute: async (params, options: ToolExecutionOptions) => {
          const response = await getRecommendationsTool.execute(params, options);
          if (response.ui) {
            streamingData.append({
              type: 'ui',
              content: response.ui,
              toolCallId: options.toolCallId
            });
          }
          return response;
        }
      },
    },
    
  });

  const response = result.toDataStreamResponse();
  
  // Generate video for the complete message
  if (currentMessage) {
    const videoUrls = await generateVideo(currentMessage);
    if (videoUrls) {
      streamingData.append({
        type: 'videoUrls',
        content: {
          hls_url: videoUrls?.hls_url as string,
          mp4_url: videoUrls?.mp4_url as string
        }
      });
    }
  }

  return response;
}
