export interface ChatSessionMetadata {
  programId?: string;
  organizationId?: string;
  userId?: string;
  lastActive?: string;
  source?: string;
  [key: string]: any;
}
