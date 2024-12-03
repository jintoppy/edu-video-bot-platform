import { db } from "@/lib/db";
import { counselorAssignments } from "@/lib/db/schema";
import { GraphStateType } from "../graph";

export async function createCounselorAssignment(state: GraphStateType) {
  try {
    // Extract relevant information from state
    const studentId = state.metadata.userId;
    const programId = state.context?.programs?.[0]?.id;
    const conversationId = state.metadata.sessionId;
    
    if (!studentId || !conversationId) {
      throw new Error("Student ID and Conversation ID are required to create counselor assignment");
    }

    // Create the assignment
    const assignment = await db.insert(counselorAssignments).values({
      studentId,
      programId: programId || null,
      conversationId,
      status: "open",
      priority: "medium",
      notes: state.messages.length > 0 
        ? `Last message: ${state.messages[state.messages.length - 1].content}`
        : "Student requested counselor assistance",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return assignment;
  } catch (error) {
    console.error("Error creating counselor assignment:", error);
    throw error;
  }
}
