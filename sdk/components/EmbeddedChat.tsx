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
      className={`${mode === 'widget' ? 'fixed bottom-4 right-4' : ''} z-50`} 
      style={themeStyles}
    >
        <div
          className={`bg-white rounded-lg shadow-xl ${
            isMinimized ? "w-72" : "w-96 h-[600px]"
          }`}
          style={{ fontFamily: theme?.fontFamily }}
        >
          {/* Chat Header */}
          <div
            className="flex items-center justify-between p-4 border-b text-white"
            style={{ backgroundColor: theme?.primaryColor }}
          >
            <h3 className="font-semibold">Student Counseling</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:opacity-80"
              >
                {isMinimized ? (
                  <Maximize2 className="w-4 h-4" />
                ) : (
                  <Minimize2 className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onClose?.();
                }}
                className="hover:opacity-80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <div className="h-[calc(600px-64px)]">
              <ChatInterface
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
                uiContent={uiContent}
                theme={theme}
              />
            </div>
          )}
        </div>
      
    </div>
  );
}
