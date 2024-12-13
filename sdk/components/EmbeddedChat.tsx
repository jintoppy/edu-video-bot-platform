// src/sdk/components/EmbeddedChat.tsx
import React, { useState, useEffect, useRef } from "react";
import { X, Minimize2, Maximize2, MessageSquare, VideoOff, Video } from "lucide-react";
import { ChatInterface } from "./ChatInterface";
import { VideoPlayer } from "./VideoPlayer";
import type { OrganizationTheme } from "../lib/types";
import { createApiClient, getApiClient } from "../lib/api";
import { UIComponent, UIStreamHandler } from "./UIStreamHandler";
import { Message, useChat } from "ai/react";
import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { SimliClient } from "simli-client";
import Pusher from "pusher-js";
import VideoBox from "./VideoBox";
// Dynamically import UI components
const ProgramList = dynamic(() => import("./ui/program-list"));
const ContactForm = dynamic(() => import("./ui/contact-form"));
const ProfileForm = dynamic(() => import("./ui/profile-form"));

console.log('hello')
const simliClient = new SimliClient();

interface EmbeddedChatProps {
  apiKey: string;
  programId?: string;
  orgId?: string;
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

const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
});

export function EmbeddedChat({
  apiKey,
  orgId,
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
  const isSimliInitialized = useRef(false);
  const [uiComponent, setUIComponent] = useState<UIComponent | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isAvatarVisible, setIsAvatarVisible] = useState(false);
  const [error, setError] = useState("");
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isMicrophoneOn, setIsMicrophoneOn] = useState(false);

  console.log("error", error);

  console.log("sessionId", sessionId);
  console.log("orgId", orgId);

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
    sendExtraMessageFields: true,
    body: {
      orgId,
      sessionId,
    },
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

  // Initialize Simli client
  useEffect(() => {
    if (
      settings?.features?.videoBot &&
      videoRef.current &&
      audioRef.current &&
      !isSimliInitialized.current
    ) {
      console.log("Initializing Simli client");
      simliClient.Initialize({
        apiKey: process.env.NEXT_PUBLIC_SIMLI_API_KEY || "",
        faceID: process.env.NEXT_PUBLIC_SIMLI_FACE_ID || "",
        handleSilence: true,
        maxSessionLength: 3600,
        maxIdleTime: 600,
        videoRef: {
          current: videoRef.current,
        },
        audioRef: {
          current: audioRef.current,
        },
      });

      simliClient.on("connected", () => {
        console.log("SimliClient connected");
        setIsAvatarVisible(true);
        const audioData = new Uint8Array(6000).fill(0);
        simliClient.sendAudioData(audioData);
      });
      
      isSimliInitialized.current = true;
    }

    // return () => {
      // if (simliClient) {
      //   simliClient.close();
      // }
    // };
  }, [settings?.features?.videoBot, videoRef.current, audioRef.current]);

  const startVideo = () => {
    if(simliClient){
      setIsVideoOn(true);
      simliClient.start();
    }
  }

  useEffect(() => {
    if (!sessionId) return;

    

    const channel = pusher.subscribe(`chat-${sessionId}`);

    // channel.bind("text-chunk", (data: { text: string }) => {
    //   // Handle incoming text chunks
    //   append({
    //     id: Date.now().toString(),
    //     role: "assistant",
    //     content: data.text,
    //   });
    // });

    channel.bind(
      "audio-chunk",
      (data: { chunk: number[]; chunkIndex: number }) => {
        if (simliClient && isAvatarVisible && isVideoOn) {
          console.log('avatar visible');
          // Convert array back to Uint8Array and send to Simli
          const audioData = new Uint8Array(data.chunk);
          simliClient.sendAudioData(audioData);
        }
      }
    );

    channel.bind("error", (data: { message: string }) => {
      setError(data.message);
    });

    return () => {
      pusher.unsubscribe(`chat-${sessionId}`);
    };
  }, [sessionId, isAvatarVisible, append]);

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

  console.log("settings", settings);

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
              <button className="p-2 rounded-full" onClick={startVideo}>
                {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
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
              <div className="aspect-video bg-gray-100 relative">
                <div className="aspect-video flex rounded-sm overflow-hidden items-center h-[350px] w-[350px] justify-center bg-gray-100">
                  <video ref={videoRef} autoPlay playsInline height="350" width="350" />
                  <audio ref={audioRef} autoPlay />
                </div>
              </div>
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
      />
    </div>
  );
}
