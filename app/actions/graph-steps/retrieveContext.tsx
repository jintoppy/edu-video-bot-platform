import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { db } from '@/lib/db';
import { eq, and, like, or } from 'drizzle-orm';
import { documentation, programs, studentProfiles } from '@/lib/db/schema';
import { loadVectorStore } from "@/lib/chat-utils";
import { GraphStateType } from "../graph";
import { generateEmbedding, rankAndCombineResults } from "@/lib/embedding";
import { Document } from "@langchain/core/documents";

const routerModel = new ChatAnthropic({ model: "claude-3-5-sonnet-20241022", temperature: 0 });
const topK = 3;

export async function retrieveContext(state: GraphStateType) {
  console.log('STEP: retrieveContext');
  const vectorStore = await loadVectorStore();
  state.uiStream.update(<p className="text-gray-500">Retrieving relevant information...</p>);
  let context;

  switch (state.queryType) {
    case 'GENERAL_QUESTION': {
      const query = state.messages[state.messages.length - 1].content;
      
      // Vector search
      const queryVector = await generateEmbedding(query.toString());
      let vectorResults: [Document<Record<string, any>>, number][] = [];
      if (queryVector.embedding) {
        vectorResults = await vectorStore.similaritySearchVectorWithScore(queryVector.embedding, topK);
      }

      // Text search
      const textResults = await db.query.documentation.findMany({
        where: or(
          like(documentation.content, `%${query}%`),
          like(documentation.title, `%${query}%`)
        ),
        columns: {
          id: true,
          title: true,
          content: true,
          category: true,
          description: true,
        },
        limit: topK
      });

      // Combine and rank results
      context = await rankAndCombineResults(
        vectorResults,
        textResults.map(doc => ({
          ...doc,
          documentId: doc.id
        })),
        query.toString()
      );
      
      if (!context.length) {
        context = [];
      }
      break;
    }
    case 'SPECIFIC_PROGRAM': {
      const query = state.messages[state.messages.length - 1].content;
      const programName = await routerModel.invoke([
        new SystemMessage("Extract the program name from this query. Return only the name."),
        new HumanMessage(query.toString()),
      ]);

      const programResults = await db.select()
        .from(programs)
        .where(like(programs.name, `%${programName.content.toString().trim()}%`));
      context = programResults;
      break;
    }
    case 'RECOMMENDATION_REQUEST': {
      const profile = await db.query.studentProfiles.findFirst({
        where: eq(studentProfiles.userId, state.metadata.userId),
      });

      const conditions = [eq(programs.isActive, true)]
      if(profile?.desiredLevel){
        conditions.push(eq(programs.level, profile.desiredLevel));
      }

      const recommendations = await db.select()
        .from(programs)
        .where(and(...conditions))
        .limit(5);

      context = { profile, recommendations };
      break;
    }
  }

  console.log('context');
  console.log(context);

  return {
    ...state,
    context,
    currentStep: 'context_retrieved',
  };
}
