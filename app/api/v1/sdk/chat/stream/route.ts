import { openai } from "@ai-sdk/openai";
import { groq } from "@ai-sdk/groq";
import {
  JSONValue,
  StreamData,
  streamText,
  tool,
  ToolExecutionOptions,
} from "ai";
import { createDynamicRecommendationsTool } from "./chat-utils";
import {
  createClassifyQueryTool,
  createCollectUserInfoTool,
  createHumanCounselorTool,
  logChatMessage,
  searchProgramsTool,
  searchVectorDBTool,
} from "./tools";
import { generateSpeech, pusher } from "./video-utils";
import { create } from "domain";

// System prompt to guide the model's behavior
const SYSTEM_PROMPT = `You are a virtual educational counseling assistant for an education consultancy. 
Speak in the first person as if you are a knowledgeable and friendly representative of the consultancy.

First, collect user's basic information if not already provided.

Always start with:
1. If this is the first message, get user's name and email
2. After collecting info, call the collectUserInfo tool, and, proceed with normal conversation

For regular conversations:
1. Classify user queries into appropriate categories
2. Provide helpful responses based on the query type
3. Collect necessary information when needed
4. Be polite and professional in all interactions

For counselor requests:
1. Explain that you'll collect some information to match them with the best counselor
2. Use the humanCounselor tool to collect all necessary details
3. Assure them about the follow-up process

For general questions about foreign education or about the services provided or similar topics, or if there is any question about the consultancy, use searchVectorDBTool to find relevant information. If no relevant information is found, inform the same and suggest to connect with Human Counselor.
For specific programs, provide detailed program information.
For program recommendations or eligiblity check, call getRecommendations after collecting required parameters. if there are any programs available, just mention "Here are the programs". If no programs available, just mentions "No suitable programs found". Do not mention anything else. 
For irrelevant queries, politely redirect to education-related topics.

Important Notes: 
  1. DO Not make up wrong information.
  2. If there is any confusion or unclear information, suggest to arrange a callback from Human Counselor.
  3. Always respond in clear and concise manner. Reply in maximum 2-3 sentences.
  4. When a user asks, "What do you do?" or similar questions, assume they are inquiring about the consultancy's services. 
`;

export const maxDuration = 30; // Allow streaming responses up to 30 seconds

type StreamResponse = {
  hls_url: string;
  mp4_url: string;
};

async function generateVideo(text: string): Promise<StreamResponse | null> {
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ttsAPIKey: process.env.TTS_API_KEY,
      simliAPIKey: process.env.SIMLI_API_KEY,
      faceId: process.env.SIMLI_FACE_ID,
      user_id: process.env.TTS_USER_ID,
      requestBody: {
        audioProvider: "PlayHT",
        text: text,
        voice:
          "s3://voice-cloning-zero-shot/e5df2eb3-5153-40fa-9f6e-6e27bbb7a38e/original/manifest.json",
        quality: "draft",
        speed: 1,
        sample_rate: 24000,
        voice_engine: "PlayHT2.0-turbo",
        output_format: "mp3",
        emotion: "female_happy",
        voice_guidance: 3,
        style_guidance: 20,
        text_guidance: 1,
      },
    }),
  };

  try {
    const response = await fetch(
      "https://api.simli.ai/textToVideoStream",
      options
    );
    const data: StreamResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error generating video:", error);
    return null;
  }
}

const sessionRecommendationTool = new Map<string, any>();
const sessionCollectUserInfoTool = new Map<string, any>();
const sessionClassifyQueryTool = new Map<string, any>();
const sessionHumanCounselorTool = new Map<string, any>();

export async function POST(req: Request) {
  const { messages, orgId, sessionId } = await req.json();

  console.log("messages", messages);
  console.log("organizationId", orgId);
  console.log("sessionId", sessionId);

  const streamingData = new StreamData();
  let currentMessage = "";
  let currentMessageChunk = "";
  let messageBuffer = "";

  try {
    let recommendationsTool = sessionRecommendationTool.get(sessionId);
    let collectUserInfoTool = sessionCollectUserInfoTool.get(sessionId);
    let classifyQueryTool = sessionClassifyQueryTool.get(sessionId);
    let humanCounselorTool = sessionHumanCounselorTool.get(sessionId);

    if (!recommendationsTool) {
      recommendationsTool = await createDynamicRecommendationsTool(orgId);
      if (!recommendationsTool) {
        throw new Error("Failed to create recommendations tool");
      }
      sessionRecommendationTool.set(sessionId, recommendationsTool);
    }

    if (!collectUserInfoTool) {
      collectUserInfoTool = createCollectUserInfoTool(sessionId);
      if (!collectUserInfoTool) {
        throw new Error("Failed to create collectUserInfoTool tool");
      }
      sessionCollectUserInfoTool.set(sessionId, collectUserInfoTool);
    }

    if (!classifyQueryTool) {
      classifyQueryTool = createClassifyQueryTool(sessionId);
      if (!classifyQueryTool) {
        throw new Error("Failed to create collectUserInfoTool tool");
      }
      sessionClassifyQueryTool.set(sessionId, classifyQueryTool);
    }

    if(!humanCounselorTool) {
      humanCounselorTool = createHumanCounselorTool(sessionId);
      if(!humanCounselorTool) {
        throw new Error("Failed to create humanCounselorTool tool");
      }
      sessionHumanCounselorTool.set(sessionId, humanCounselorTool);  
    }

    let completeResponse = "";
    const userMessage = messages[messages.length - 1];    
    const result = streamText({
      onChunk: async ({ chunk }) => {
        if (chunk.type === "text-delta") {
          currentMessageChunk += chunk.textDelta;
          messageBuffer += chunk.textDelta;
          completeResponse += chunk.textDelta;

          // Process text in natural language chunks (sentences or phrases)
          if (currentMessageChunk.match(/[.!?]\s|[:;]\s|\n/)) {
            // Send the accumulated chunk through Pusher
            await pusher.trigger(`chat-${sessionId}`, "text-chunk", {
              text: currentMessageChunk,
            });

            // Generate and stream audio for the chunk
            await generateSpeech(currentMessageChunk, sessionId);

            currentMessageChunk = ""; // Reset the chunk buffer
          }
        }
      },
      // model: groq('llama-3.3-70b-versatile'),
      model: openai("gpt-4-turbo"),
      system: SYSTEM_PROMPT,
      messages,
      maxSteps: 5,
      tools: {
        collectUserInfo: {
          ...collectUserInfoTool,
          execute: async (params: any, options: ToolExecutionOptions) => {
            const response = await collectUserInfoTool.execute(params, options);
            // Append UI data to stream if present
            if (response.ui) {
              streamingData.append({
                type: "ui",
                content: response.ui,
              });
            }
            return response;
          },
        },
        humanCounselor: {
          ...humanCounselorTool,
          execute: async (params: any, options: ToolExecutionOptions) => {
            const response = await humanCounselorTool.execute(params, options);
            if (response.ui) {
              streamingData.append({
                type: "ui",
                content: response.ui,
                toolCallId: options.toolCallId,
              });
            }
            return response;
          },
        },
        classifyQuery: {
          ...classifyQueryTool,
          execute: async (params: any, options: ToolExecutionOptions) => {
            const response = await classifyQueryTool.execute(params, options);
            if (response.ui) {
              // Transform fields to ensure JSON compatibility
              const uiContent = {
                type: response.ui.type,
                fields: response.ui.fields.map((field: any) => ({
                  ...field,
                  // Ensure optional properties are always defined with null instead of undefined
                  options: field.options || null,
                  required: field.required || false,
                  placeholder: field.placeholder || null,
                })),
              };

              streamingData.append({
                type: "ui",
                content: uiContent as JSONValue,
                toolCallId: options.toolCallId,
              });
            }
            return response;
          },
        },
        searchVectorDB: searchVectorDBTool,
        _searchPrograms: searchProgramsTool,
        get searchPrograms() {
          return this._searchPrograms;
        },
        set searchPrograms(value) {
          this._searchPrograms = value;
        },
        getRecommendations: {
          ...recommendationsTool,
          execute: async (params: any, options: ToolExecutionOptions) => {
            const response = await recommendationsTool.execute(params, options);
            if (response.ui) {
              streamingData.append({
                type: "ui",
                content: response.ui,
                toolCallId: options.toolCallId,
              });
            }
            return response;
          },
        },
      },
      onFinish: async () => {
        console.log("onFinish");
        console.log("currentMessage", currentMessage);
        if (currentMessageChunk) {
          await pusher.trigger(`chat-${sessionId}`, "text-chunk", {
            text: currentMessageChunk,
            final: true,
          });
          await generateSpeech(currentMessageChunk, sessionId);
        }
        await logChatMessage({
          sessionId,
          message: userMessage.content,
          messageType: "user_message",
        });
        await logChatMessage({
          sessionId,
          message: completeResponse,
          messageType: "bot_message",
        });
        streamingData.close();
      },
    });

    return result.toDataStreamResponse({
      data: streamingData,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat message" }),
      { status: 500 }
    );
  }

  //   async transform(chunk, controller) {
  //     // Forward the original chunk
  //     console.log('insisde trasform');
  //     controller.enqueue(chunk);
  //   },
  //   async flush(controller) {
  //     console.log('inside flush')
  //     // After all chunks are processed, generate and send video URLs
  //     if (currentMessage.trim()) {
  //       console.log('Generating video for message:', currentMessage);
  //       const videoUrls = await generateVideo(currentMessage);
  //       console.log('videoUrls', videoUrls);
  //       if (videoUrls) {
  //         streamingData.append({
  //           type: 'videoUrls',
  //           content: {
  //             hls_url: videoUrls.hls_url,
  //             mp4_url: videoUrls.mp4_url
  //           }
  //         });

  //         // Get the formatted SSE data from streamingData
  //         const videoEventData = `data: ${JSON.stringify({
  //           type: 'videoUrls',
  //           content: {
  //             hls_url: videoUrls.hls_url,
  //             mp4_url: videoUrls.mp4_url
  //           }
  //         })}\n\n`;

  //         controller.enqueue(new TextEncoder().encode(videoEventData));
  //       }
  //       streamingData.close();
  //     }
  //   }
  // });

  // // Pipe the original response through our transform stream
  // const transformedBody = response.body?.pipeThrough(transformStream);

  // return new Response(transformedBody, {
  //   headers: {
  //     'Content-Type': 'text/event-stream',
  //     'Cache-Control': 'no-cache',
  //     'Connection': 'keep-alive',
  //   },
  // });
}
