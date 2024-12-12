export interface ChatSessionMetadata {
  programId?: string;
  organizationId?: string;
  userId?: string;
  lastActive?: string;
  source?: string;
  [key: string]: any;
}

export interface CounselorStatus {
  counselorId: string;
  isOnline: boolean;
  lastActiveAt: Date;
}

export interface VideoSessionRequest {
  studentId: string;
  chatSessionId: string;
  studentName: string;
  chatSummary: string;
}

export interface VideoSessionResponse {
  accepted: boolean;
  counselorId: string;
  roomName?: string;
}
