// app/components/chat-interface.tsx
import React, { useState } from "react";
import { Message, useChat } from "ai/react";
import { VideoPlayer } from "./VideoPlayer";
import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { JSONValue } from "ai";

// Dynamically import UI components
const ProgramList = dynamic(() => import("./ui/program-list"));
const ContactForm = dynamic(() => import("./ui/contact-form"));
const ProfileForm = dynamic(() => import("./ui/profile-form"));

interface UIComponent {
  type: string;
  data: any;
  messageId?: string;
  isVisible: boolean;
}

// Component to handle UI stream data
const UIStreamHandler = ({
  streamingData,
  setUIComponent,
}: {
  streamingData?: JSONValue[];
  setUIComponent: React.Dispatch<React.SetStateAction<UIComponent | null>>;
}) => {
  React.useEffect(() => {
    if (!streamingData?.length) return;

    // Process the latest streaming data
    const lastData = streamingData[streamingData.length - 1];

    if (
      typeof lastData === "object" &&
      lastData !== null &&
      "type" in lastData &&
      "content" in lastData
    ) {
      if (lastData.type === "ui") {
        setUIComponent({
          type: (lastData.content as any).type,
          data: lastData.content as any,
          messageId: (lastData as any).messageId,
          isVisible: true,
        });
      }
    }
  }, [streamingData, setUIComponent]);

  return null;
};

interface ChatInterfaceProps {
  initialMessages?: any[];
  onFinish?: () => void;
}

export function ChatInterface({
  initialMessages,
  onFinish,
}: ChatInterfaceProps) {
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
    initialMessages,
    onFinish,
  });

  const [uiComponent, setUIComponent] = useState<UIComponent | null>(null);

  const renderToolInvocation = (toolInvocation: any) => {
    const { toolName, state, result } = toolInvocation;

    console.log("toolInvocation", toolInvocation);
    // Show loading state
    if (state !== "result") {
      return <div className="animate-pulse">Processing...</div>;
    }

    // Render different UIs based on tool results
    switch (toolName) {
      case "classifyQuery":
        const { category, ui } = result;
        switch (category) {
          case "getRecommendations":
            return (
              <ProfileForm fields={ui.fields} onSubmit={handleProfileSubmit} />
            );
          case "humanCounselor":
            return (
              <ContactForm fields={ui.fields} onSubmit={handleContactSubmit} />
            );
          default:
            return null;
        }

      case "getRecommendations":
        return (
          <ProgramList
            programs={result.ui.programs}
            onSelect={handleProgramSelect}
          />
        );

      default:
        return null;
    }
  };

  const handleProfileSubmit = async (data: any) => {
    // Handle profile form submission
    const message: Message = {
      id: Date.now().toString(),
      role: "user",
      content: "Here's my profile information: " + JSON.stringify(data),
    };

    await append(message);
  };

  const handleContactSubmit = async (data: any) => {
    const message: Message = {
      id: Date.now().toString(),
      role: "user",
      content: "Please contact me at: " + JSON.stringify(data),
    };

    await append(message);
  };

  const handleProgramSelect = async (programId: string) => {
    const message: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `I'm interested in program ${programId}. Can you tell me more about it?`,
    };

    await append(message);
  };

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

  // Filter out messages that have associated UI components
  const filteredMessages = messages.filter(
    (message) =>
      message.role === "user" ||
      (message.role === "assistant" &&
        (!uiComponent || message.id !== uiComponent.messageId))
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Messages */}
        {filteredMessages.map((message) => (
          <div key={message.id} className="message-container">
            <div
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div className="space-y-2">
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100"
                  }`}
                >
                  {message.content}
                </div>
                {message.role === "assistant" && message.videoUrls && (
                  <VideoPlayer 
                    hlsUrl={message.videoUrls.hls_url} 
                    mp4Url={message.videoUrls.mp4_url}
                  />
                )}
              </div>
            </div>
          </div>
        ))}

        {/* UI Components */}
        <AnimatePresence>
          {uiComponent?.isVisible && (
            <div className="my-4">{renderUIComponent(uiComponent)}</div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="animate-pulse">Processing...</div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>

      {/* UI Stream Handler */}
      <UIStreamHandler
        streamingData={streamingData || []}
        setUIComponent={setUIComponent}
      />
    </div>
  );
}
