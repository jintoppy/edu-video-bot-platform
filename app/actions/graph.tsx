"use server";

import {
  StateGraph,
  Annotation,
  START,
  END,
} from "@langchain/langgraph";
import {
  HumanMessage,
  BaseMessage,
  AIMessage,
} from "@langchain/core/messages";
import { createStreamableUI } from "ai/rsc";
import { db } from "@/lib/db";
import { chatSessions, chatMessages } from "@/lib/db/schema";
import { ProgramInterface } from "@/components/programs/program-card";
import {
  StudentProfileInterface,
} from "@/components/profile/student-profile-view";
import { classifyQueryType } from "./graph-steps/classifyQueryType";
import { retrieveContext } from "./graph-steps/retrieveContext";
import { generateResponse } from "./graph-steps/generateResponse";

interface SerializedMessage {
  role: "user" | "assistant";
  content: string;
  id: string;
  sessionId?: string;
}

// Define the Graph State
const GraphState = Annotation.Root({
  messages: Annotation({
    reducer: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
  }),
  queryType: Annotation<string | null>({
    reducer: (x, y) => y ?? x ?? null,
    default: () => null,
  }),
  context: Annotation<{
    programs?: ProgramInterface[];
    profile?: StudentProfileInterface;
    generalInfo?: any[];
  } | null>({
    reducer: (x, y) => (y === null ? null : y ?? x ?? null),
    default: () => null,
  }),
  relevanceScore: Annotation<number | null>({
    reducer: (x, y) => y ?? x ?? null,
    default: () => null,
  }),
  uiStream: Annotation<any>({
    reducer: (x, y) => y ?? x,
  }),
  currentStep: Annotation<string>({
    reducer: (x, y) => y ?? x ?? "start",
    default: () => "start",
  }),
  metadata: Annotation<{
    userId: string;
    sessionId: string;
  }>({
    reducer: (x, y) => ({ ...x, ...y }),
    default: () => ({
      userId: "",
      sessionId: "",
    }),
  }),
});

export type GraphStateType = typeof GraphState.State;

// State Machine Definition
const workflow = new StateGraph(GraphState)
  .addNode("classify_query", classifyQueryType)
  .addNode("retrieve_context", retrieveContext)
  .addNode("generate_response", generateResponse)
  .addEdge(START, "classify_query")
  .addConditionalEdges("classify_query", (state) =>
    state.queryType === "IRRELEVANT" ? "generate_response" : "retrieve_context"
  )
  .addEdge("retrieve_context", "generate_response")
  .addEdge("generate_response", END);

const chatGraph = workflow.compile();

// Serialization helpers
function convertToLangChainMessages(messages: SerializedMessage[]) {
  return messages.map((msg) =>
    msg.role === "user"
      ? new HumanMessage(msg.content)
      : new AIMessage(msg.content)
  );
}

function serializeMessages(messages: (AIMessage | HumanMessage)[], sessionId: string) {
  return messages.map((msg) => ({
    role: msg instanceof HumanMessage ? "user" : "assistant",
    content: msg.content.toString(),
    id: crypto.randomUUID(),
    sessionId,
  }));
}

async function chat(
  prevMessages: SerializedMessage[],
  message: string,
  userId: string,  
  uiStream: any,
  sessionId?: string,
) {
  return chatGraph
    .invoke(
      {
        messages: [
          ...convertToLangChainMessages(prevMessages),
          new HumanMessage(message),
        ],
        currentStep: START,
        uiStream,
        metadata: {
          userId,
          sessionId,
        },
      },
      {
        configurable: { thread_id: sessionId },
      }
    )
    .then((result) => {
      return {
        messages: serializeMessages(result.messages, result.metadata.sessionId),
        queryType: result.queryType
      };
    });
}
// Updated server action
export async function chatAction(
  messages: SerializedMessage[],
  input: string,
  userId: string
) {
  try {
    const uiStream = createStreamableUI();
    const userMessages = messages.filter(msg => msg.role === 'user');
    // Create or get existing chat session
    let sessionId: string | undefined;
    if (userMessages.length <= 1) { // Only system message present - new chat
      const [session] = await db.insert(chatSessions).values({
        studentId: userId,
        communicationMode: "text_only",
        category: "general_query",
        startTime: new Date(),
        status: "active"
      }).returning({ id: chatSessions.id });
      console.log('inserted');
      console.log('sessionId', sessionId)
      console.log(session);
      sessionId = session.id;
    } else {
      // Get the existing session ID from the first message
      sessionId = messages[0].sessionId;
    }

    // Store user message
    await db.insert(chatMessages).values({
      sessionId,
      userId,
      messageType: "user_message",
      content: input
    });

    const resultPromise = chat(messages.map(msg => ({...msg, sessionId})), input, userId, uiStream, sessionId);
    
    // Handle AI response
    const result = await resultPromise;
    const aiMessage = result.messages[result.messages.length - 1];
    
    if (aiMessage.role === 'assistant') {
      await db.insert(chatMessages).values({
        sessionId,
        messageType: "bot_message",
        content: aiMessage.content.toString()
      });
    }

    // Add sessionId to messages for future reference
    const messagesWithSession = {
      ...result,
      messages: result.messages.map(msg => {
          return {
            ...msg,
            sessionId,
            queryType: result.queryType
          } 
      })
    };

    return {
      resultPromise: Promise.resolve(messagesWithSession),
      serverUi: uiStream.value,
    };
  } catch (error) {
    console.error("Chat action error:", error);
    throw error;
  }
}
