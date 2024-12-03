import { MessageType } from "@/lib/db/schema";

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  messageType: MessageType;
  content: string;
  metadata?: {
    attachments?: string[];
    links?: string[];
    programIds?: string[];
    actionItems?: string[];
    [key: string]: any;
  };
  timestamp: Date;
  isEdited: boolean;
  editedAt?: Date;
  programReferences?: string[];
  createdAt: Date;
}
