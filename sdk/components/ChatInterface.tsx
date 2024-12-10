import React, { useState } from "react";
import { Send } from "lucide-react";
import type { OrganizationTheme } from "../lib/types";

interface ChatInterfaceProps {
  onSendMessage: (message: string) => void;
  messages: any[];
  isLoading?: boolean;
  uiContent?: any;
  theme?: OrganizationTheme;
}

export function ChatInterface({
  onSendMessage,
  messages,
  isLoading,
  uiContent,
  theme,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
            {/* Regular message content */}
            <div
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user" ? "text-white" : "bg-gray-100 text-gray-900"
                }`}
                style={
                  message.role === "user"
                    ? { backgroundColor: theme?.primaryColor || '#4A7DFF' }
                    : undefined
                }
              >
                {message.content}
              </div>
            </div>

            {/* UI content if present */}
            {message.role === "assistant" && uiContent && (
              <div className="mt-2">
                {/* Render UI content here */}
                {/* <div dangerouslySetInnerHTML={{ __html: uiContent }} /> */}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="animate-pulse">Typing...</div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border p-2 focus:outline-none focus:ring-2"
            style={
              {
                fontFamily: theme?.fontFamily,
                "--tw-ring-color": theme?.primaryColor,
              } as React.CSSProperties
            }
          />
          <button
            onClick={handleSend}
            className="text-white rounded-lg p-2 hover:opacity-90"
            style={{ backgroundColor: theme?.primaryColor }}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
