import { ChatAnthropic } from "@langchain/anthropic";
import { AIMessage, SystemMessage } from "@langchain/core/messages";
import { createCounselorAssignment } from "../counselor/create-assignment";
import { ProgramCard } from "@/components/programs/program-card";
import { StudentProfileView } from "@/components/profile/student-profile-view";
import { GraphStateType } from "../graph";
import { END } from "@langchain/langgraph";
import Link from "next/link";

const responseModel = new ChatAnthropic({
  model: "claude-3-5-sonnet-20241022",
  temperature: 0.7,
});

export async function generateResponse(
  state: GraphStateType
): Promise<Partial<GraphStateType>> {
  if (!state.queryType) {
    return {
      messages: [
        new AIMessage(
          "I'm sorry, but I couldn't process your request properly. Could you please try again?"
        ),
      ],
      currentStep: END,
    };
  }

  switch (state.queryType) {
    case "GENERAL_QUESTION": {
      state.uiStream.update(
        <div className="animate-pulse">
          <p className="text-gray-500">
            Finding the answer to your question...
          </p>
        </div>
      );

      const response = await responseModel.invoke([
        new SystemMessage(`
            Answer the query using this context. Be concise but informative. Maximum 3 sentence.
            Format the response to be easily readable.
            Context: ${state.context?.generalInfo ? JSON.stringify(state.context.generalInfo): 'No Context available'}
          `),
        ...state.messages,
      ]);

      state.uiStream.done(
        <div className="prose max-w-none">
          <div
            className="mb-4 text-gray-700"
            style={{ whiteSpace: "pre-wrap" }}
          >
            {response.content.toString()}
          </div>
        </div>
      );

      return {
        messages: [...state.messages, response],
        currentStep: "response_generated",
      };
    }

    case "SPECIFIC_PROGRAM": {
      const program = state.context && state.context.programs && state.context.programs.length > 0 ? state.context.programs?.[0] : null;
      if (!program) {
        state.uiStream.done(
          <div className="text-yellow-600">
            {`I couldn't find the specific program you're looking for. 
              Would you like to browse similar programs instead?`}
          </div>
        );
        return {
          messages: [
            new AIMessage(
              "I couldn't find that specific program. Would you like to explore similar options?"
            ),
          ],
          currentStep: "response_generated",
        };
      }

      state.uiStream.update(
        <div className="animate-pulse">
          <p className="text-gray-500">Retrieving program details...</p>
        </div>
      );

      const response = await responseModel.invoke([
        new SystemMessage(`
            Provide detailed information about this program. 
            Include key benefits and requirements.
            Program details: ${JSON.stringify(program)}
          `),
        ...state.messages,
      ]);

      const showEnrollment =
        response.content.toString().toLowerCase().includes("enroll") ||
        state.messages[state.messages.length - 1].content
          .toString()
          .toLowerCase()
          .includes("enroll");

      state.uiStream.done(
        <div className="space-y-4">
          <ProgramCard program={program} />
          <div className="prose max-w-none">{response.content.toString()}</div>
          {showEnrollment && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
              <div className="max-w-2xl mx-auto flex items-center justify-between">
                <div>
                  <h4 className="font-bold">{program.name}</h4>
                  <p className="text-sm text-gray-600">
                    Ready to take the next step?
                  </p>
                </div>
                <button className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 font-semibold">
                  Start Enrollment
                </button>
              </div>
            </div>
          )}
        </div>
      );

      return {
        messages: [...state.messages, response],
        currentStep: "response_generated",
      };
    }

    case "RECOMMENDATION_REQUEST": {
      if(!state.context){
        state.uiStream.done(
          <div className="text-yellow-600">
            No Info available
          </div>
        );
        return {
          messages: [
            new AIMessage(
              "I need more information to make personalized recommendations. Please tell me more about  yourself"
            ),
          ],
          currentStep: "response_generated",
        };
      }
      const { profile, programs: recommendations } = state.context;
      if (!profile || !recommendations?.length) {
        state.uiStream.done(
          <div className="text-yellow-600">
            I need more information about your preferences to make personalized
            recommendations. Would you like to complete your profile?
          </div>
        );
        return {
          messages: [
            new AIMessage(
              "I need more information to make personalized recommendations. Shall we update your profile?"
            ),
          ],
          currentStep: "response_generated",
        };
      }

      state.uiStream.update(
        <div className="space-y-4">
          <StudentProfileView profile={profile} />
          <div className="animate-pulse">
            <p className="text-gray-500">
              Finding the best programs for your profile...
            </p>
          </div>
        </div>
      );

      // Stream program cards one by one
      recommendations.forEach((program, index) => {
        setTimeout(() => {
          state.uiStream.append(
            <div className="animate-fade-in transform transition-all duration-500 translate-y-0">
              <ProgramCard program={program} />
            </div>
          );
        }, index * 300);
      });

      const response = await responseModel.invoke([
        new SystemMessage(`
            Recommend programs based on this student's profile.
            Explain why each program is a good fit.
            Profile: ${JSON.stringify(profile)}
            Programs: ${JSON.stringify(recommendations)}
          `),
        ...state.messages,
      ]);

      state.uiStream.done(
        <div className="space-y-6">
          <StudentProfileView profile={profile} />
          <div className="prose max-w-none">{response.content.toString()}</div>
          <div className="space-y-4">
            {recommendations.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="font-semibold">Want to explore more options?</p>
            <p className="text-sm text-gray-600">
              We can refine these recommendations based on your preferences.
            </p>
            <button className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
              Refine Search
            </button>
          </div>
        </div>
      );

      return {
        messages: [...state.messages, response],
        currentStep: "response_generated",
      };
    }

    case "HUMAN_COUNSELOR": {
      try {
        await createCounselorAssignment(state);
        
        state.uiStream.done(
          <div className="rounded-lg border p-4 bg-blue-50">
            <p className="mt-2 text-gray-700">
              Our education counselors are here to help you make the best choice
              for your future. We will contact you soon.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              A counselor will be assigned to assist you with your educational journey.
            </p>
          </div>
        );

        return {
          messages: [
            new AIMessage(
              "I've arranged for a counselor to contact you. They will provide personalized guidance for your educational journey."
            ),
          ],
          currentStep: END,
        };
      } catch (error) {
        console.error("Error in counselor assignment:", error);
        
        state.uiStream.done(
          <div className="rounded-lg border p-4 bg-red-50">
            <p className="text-red-600">
              We encountered an issue while processing your request. Please try again later.
            </p>
          </div>
        );

        return {
          messages: [
            new AIMessage(
              "I apologize, but I encountered an issue while trying to connect you with a counselor. Please try again later."
            ),
          ],
          currentStep: END,
        };
      }
    }

    case "IRRELEVANT": {
      state.uiStream.done(
        <div className="rounded-lg border p-4 bg-gray-50">
          <p className="text-gray-700">
            I specialize in educational guidance and can help you with:
          </p>
          <ul className="mt-2 space-y-1 text-gray-600">
            <li>• Finding suitable programs</li>
            <li>• Understanding program requirements</li>
            <li>• Getting program recommendations</li>
            <li>• Connecting with counselors</li>
          </ul>
          <a href="/programs">
            <button className="mt-4 text-blue-500 hover:underline">
              Browse Popular Programs
            </button>
          </a>
        </div>
      );

      return {
        messages: [
          new AIMessage(
            "I can help you with educational guidance. What would you like to know about our programs?"
          ),
        ],
        currentStep: END,
      };
    }

    default: {
      return {
        messages: [
          new AIMessage(
            "I'm not sure how to help with that. Could you please rephrase your question?"
          ),
        ],
        currentStep: END,
      };
    }
  }
}
