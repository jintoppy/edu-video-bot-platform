// src/sdk/components/EmbeddedChat.tsx
import React, { useState, useEffect } from "react";
import { X, Minimize2, Maximize2, MessageSquare } from "lucide-react";
import { ChatInterface } from "./ChatInterface";
import { VideoPlayer } from "./VideoPlayer";
import type { OrganizationTheme } from "../lib/types";
import { createApiClient, getApiClient } from "../lib/api";
import { UIComponent, UIStreamHandler } from "./UIStreamHandler";
import { Message, useChat } from "ai/react";
import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

// Dynamically import UI components
const ProgramList = dynamic(() => import("./ui/program-list"));
const ContactForm = dynamic(() => import("./ui/contact-form"));
const ProfileForm = dynamic(() => import("./ui/profile-form"));

interface EmbeddedChatProps {
  apiKey: string;
  programId?: string;
  sessionId?: string;
  mode: "widget" | "inline";
  metadata?: Record<string, any>;
  settings?: {
    theme?: OrganizationTheme;
    features?: {
      liveChat: boolean;
      videoBot: boolean;
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
  // const [theme, setTheme] = useState<OrganizationTheme | null>(null);
  const [sessionId, setSessionId] = useState<string | null | undefined>(
    sessionIdFromProps
  );
  const [uiComponent, setUIComponent] = useState<UIComponent | null>(null);
  const [videoComponent, setVideoComponent] = useState<UIComponent | null>(
    null
  );

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    isLoading,
    data: streamingData,
  } = useChat({
    api: "/api/v1/sdk/chat/stream",
    initialMessages: settings?.messages?.welcome
      ? [
          {
            id: "1",
            role: "system",
            content: settings.messages.welcome,
          },
        ]
      : [],
    onFinish: () => {
      console.log("onFinish");
    },
  });

  const filteredMessages = messages.filter(
    (message) =>
      message.role === "user" ||
      (message.role === "assistant" &&
        (!uiComponent || message.id !== uiComponent.messageId))
  );

  const lastMessage = filteredMessages[filteredMessages.length - 1];

  const renderUIComponent = (component: UIComponent) => {
    switch (component.type) {
      case "programList":
        return (
          <ProgramList
            programs={component.data.programs}
            onSelect={(programId) => {
              const message: Message = {
                id: Date.now().toString(),
                role: "user",
                content: `I'm interested in program ${programId}. Can you tell me more about it?`,
              };
              append(message);
            }}
          />
        );
      case "form":
        switch (component.data.formType) {
          case "contact":
            return (
              <ContactForm
                fields={component.data.fields}
                onSubmit={async (data) => {
                  const message: Message = {
                    id: Date.now().toString(),
                    role: "user",
                    content:
                      "Here's my contact information: " + JSON.stringify(data),
                  };
                  await append(message);
                }}
              />
            );
          case "profile":
            return (
              <ProfileForm
                fields={component.data.fields}
                onSubmit={async (data) => {
                  const message: Message = {
                    id: Date.now().toString(),
                    role: "user",
                    content:
                      "Here's my profile information: " + JSON.stringify(data),
                  };
                  await append(message);
                }}
              />
            );
          default:
            return null;
        }
      default:
        return null;
    }
  };

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
    <div className="h-full w-full" style={themeStyles}>
      <div
        className="bg-white h-full w-full flex flex-col"
        style={{ fontFamily: theme?.fontFamily }}
      >
        {/* Chat Header */}
        <div className="flex flex-col">          
          <div
            className="flex items-center justify-between px-8 mr-4 py-3 border-b"
            style={{ backgroundColor: theme?.secondaryColor || "#F8FAFC" }}
          >
            <div className="flex items-center space-x-4">              
              <span className="font-medium">Educational Counselor</span>
            </div>

            <div className="flex items-center space-x-3">
              <button className="p-2 rounded-full">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M23 7l-7 5 7 5V7z"></path>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
              </button>
              <button className="p-2 rounded-full">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 rounded-full"
              >
                {isMinimized ? (
                  <Maximize2 className="w-5 h-5" />
                ) : (
                  <Minimize2 className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  onClose?.();
                }}
                className="p-2 rounded-full hover:bg-[#FEE2E2]"
                style={{
                  color: "#EF4444",
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
            {/* Left Panel - Video/UI Content */}
            <div className="w-1/2 border-r flex flex-1 flex-col">
              {settings?.features?.videoBot ? (
                <div className="aspect-video bg-gray-100 relative">
                 {videoComponent && videoComponent.data && (
                  <VideoPlayer
                    hlsUrl={videoComponent.data.hls_url}
                    mp4Url={videoComponent.data.mp4_url}
                  />
                )}
                </div>
              ) : (
                <div className="aspect-video bg-gray-50 flex items-center justify-center">
                  <img
                    src="/counselor-avatar.jpg"
                    alt="AI Counselor"
                    className="w-32 h-32 rounded-full object-cover"
                  />
                </div>
              )}

              {/* Generated UI Content */}
              <div className="flex-1 overflow-auto p-4">
                <AnimatePresence>
                  {uiComponent?.isVisible && (
                    <div className="my-4">{renderUIComponent(uiComponent)}</div>
                  )}
                </AnimatePresence>                
              </div>
            </div>

            {/* Right Panel - Chat Interface */}
            <div className="w-1/2 flex flex-col flex-1">
              <ChatInterface
                messages={filteredMessages}
                input={input}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}
      </div>
      {/* UI Stream Handler */}
      <UIStreamHandler
        streamingData={streamingData || []}
        setUIComponent={setUIComponent}
        setVideoComponent={setVideoComponent}
      />
    </div>
  );
}
