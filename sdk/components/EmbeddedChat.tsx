// src/sdk/components/EmbeddedChat.tsx
import React, { useState, useEffect } from "react";
import { X, Minimize2, Maximize2, MessageSquare } from "lucide-react";
import { ChatInterface } from "./ChatInterface";
import type { OrganizationTheme } from "../lib/types";
import { createApiClient, getApiClient } from "../lib/api";

interface EmbeddedChatProps {
  apiKey: string;
  programId?: string;
  sessionId?: string;
  mode: 'widget' | 'inline';
  metadata?: Record<string, any>;
  settings?: {
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
  };
  theme?: OrganizationTheme;
  onClose?: () => void;
}

export function EmbeddedChat({
  apiKey,
  programId,
  mode,
  sessionId: sessionIdFromProps,
  metadata = {},
  onClose,
  settings,
  theme,
}: EmbeddedChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // const [theme, setTheme] = useState<OrganizationTheme | null>(null);
  const [sessionId, setSessionId] = useState<string | null | undefined>(sessionIdFromProps);
  const [uiContent, setUiContent] = useState<any>(null);

  useEffect(() => {
    // Initialize API client first
    createApiClient(apiKey);

    // const fetchOrgSettings = async () => {
    //   // If theme is provided in props, use it
    //   if (theme) {
    //     setTheme(theme);
    //     return;
    //   }
      
    //   // Otherwise fetch from API
    //   const api = getApiClient();
    //   const response = await api.getOrgSettings(apiKey);
    //   if (response.data?.theme) {
    //     setTheme(response.data.theme);
    //   }
    // };
    
    // fetchOrgSettings();
  }, [apiKey, theme]);

  const handleSendMessage = async (content: string) => {
    const api = getApiClient();

    // Add user message immediately
    const userMessage = {
      role: "user",
      content,
      id: Date.now().toString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Start streaming
      const stream = await api.streamChat(content, sessionId, messages, {
        ...metadata,
        programId,
      });

      for await (const data of stream) {
        switch (data.type) {
          case "session":
            setSessionId(data.sessionId);
            break;
          case "message":
            setMessages((prev) => {
              const newMessages = [...prev];
              // Remove temporary message if it exists
              if (newMessages[newMessages.length - 1]?.isTemp) {
                newMessages.pop();
              }
              return [...newMessages, ...data.content.messages];
            });
            break;
          case "ui":
            setUiContent(data.content);
            break;
        }
      }
    } catch (error) {
      console.error("Error in chat:", error);
      // Handle error appropriately
    }
  };

  // Create CSS variables for theme
  const themeStyles = theme
    ? ({
        "--edubot-primary": theme.primaryColor,
        "--edubot-secondary": theme.secondaryColor,
        "--edubot-accent": theme.accentColor,
        "--edubot-font": theme.fontFamily,
      } as React.CSSProperties)
    : {};

  return (
    <div 
      className="h-full w-full" 
      style={themeStyles}
    >
        <div
          className="bg-white h-full w-full flex flex-col"
          style={{ fontFamily: theme?.fontFamily }}
        >
          {/* Chat Header */}
          <div className="flex flex-col">
            <div className="bg-white px-6 py-4 border-b">
              <h2 className="text-xl font-semibold">AI Counselor</h2>
              <p className="text-sm text-gray-500">Educational Guidance Expert</p>
            </div>
            
            <div className="flex items-center justify-between px-6 py-3 bg-white border-b">
              <div className="flex items-center space-x-4">
                <img 
                  src="/counselor-avatar.jpg" 
                  alt="AI Counselor"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <span className="font-medium">Educational Counselor</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <button 
                  className="p-2 rounded-full" 
                  style={{ 
                    '&:hover': { backgroundColor: `${theme?.primaryColor}20` || '#4A7DFF20' }
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 7l-7 5 7 5V7z"></path>
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                  </svg>
                </button>
                <button 
                  className="p-2 rounded-full"
                  style={{ 
                    '&:hover': { backgroundColor: `${theme?.primaryColor}20` || '#4A7DFF20' }
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                  </svg>
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 rounded-full"
                  style={{ 
                    '&:hover': { backgroundColor: `${theme?.primaryColor}20` || '#4A7DFF20' }
                  }}
                >
                  {isMinimized ? (
                    <Maximize2 className="w-5 h-5" />
                  ) : (
                    <Minimize2 className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onClose?.();
                  }}
                  className="p-2 rounded-full"
                  style={{ 
                    color: '#EF4444',
                    '&:hover': { backgroundColor: '#FEE2E2' }
                  }}
                >
                  End Chat
                </button>
              </div>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <div className="flex flex-1">
              <div className="w-1/3 border-r">
                <img 
                  src="/counselor-avatar.jpg" 
                  alt="AI Counselor"
                  className="w-full aspect-square object-cover"
                />
              </div>
              <div className="w-2/3 flex flex-col">
                <ChatInterface
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  uiContent={uiContent}
                  theme={theme}
                />
              </div>
            </div>
          )}
        </div>
      
    </div>
  );
}
