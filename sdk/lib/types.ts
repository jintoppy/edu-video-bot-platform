// src/sdk/lib/types.ts
export interface EduBotConfig {
  apiKey: string;
  baseUrl?: string;
  reconnectAttempts?: number;
  stateSaveInterval?: number;
  fallbackAvatar?: string;
  onConnectionLost?: () => void;
}

export interface ChatOptions {
  programId?: string;
  metadata?: Record<string, any>;
}

export interface ChatSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  status: "active" | "completed" | "cancelled";
}

export interface ChatMessage {
  id: string;
  content: string;
  type: "user" | "bot" | "system";
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface ChatResponse {
  message: string;
  sessionId: string;
}

export interface ApiChatResponse extends ApiResponse<ChatResponse> {}

export interface InitResponse
  extends ApiResponse<{
    sessionId: string;
    settings: ChatSettings;
  }> {}

export interface OrganizationTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
}

export interface ChatSettings {
  theme?: OrganizationTheme;
  features?: {
    voiceInput: boolean;
    fileUpload: boolean;
    videoChat: boolean;
  };
  messages?: {
    welcome?: string;
    placeholder?: string;
  };
}

// Event types for communication between SDK and embedded chat
export type EduBotEvent =
  | { type: "CHAT_INITIALIZED"; payload: InitResponse }
  | { type: "CHAT_CLOSE";  }
  | { type: "MESSAGE_SENT"; payload: ChatMessage }
  | { type: "MESSAGE_RECEIVED"; payload: ChatMessage }
  | { type: "SESSION_ENDED"; payload: { sessionId: string } }
  | { type: "ERROR"; payload: { message: string } };
