import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { GraphStateType } from "../graph";

const routerModel = new ChatAnthropic({ model: "claude-3-5-sonnet-20241022", temperature: 0 });

export async function classifyQueryType(state: GraphStateType) {
    console.log('STEP: classifyQueryType');
    const lastMessage = state.messages[state.messages.length - 1];
    state.uiStream.update(<p className="text-gray-500">Understanding your query...</p>);
  
    const classification = await routerModel.invoke([
      new SystemMessage(`
        Classify the user's query into one of the following:
        - GENERAL_QUESTION
        - SPECIFIC_PROGRAM
        - RECOMMENDATION_REQUEST
        - HUMAN_COUNSELOR
        - IRRELEVANT
        GENERAL_QUESTION should have only questions about the Frequently Asked Questions ( about international education ), Visa-related queries, Application process guides, General program information, Country-specific information, Financial guidance and scholarships, Test prep resources. Any other question outside of academy or foreign education related will come under IRRELEVANT category. 
        Return only the category.
      `),
      new HumanMessage(lastMessage.content.toString()),
    ]);

    console.log('classification.content', classification.content);
  
    return {
      ...state,
      queryType: classification.content.toString().trim(),
      currentStep: 'classified',
    };
  }