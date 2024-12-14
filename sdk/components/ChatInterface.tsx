// app/components/chat-interface.tsx
import React from "react";
import { Message } from "ai/react";
import { ChatRequestOptions } from "ai";
import { User, Bot, Send } from "lucide-react";

interface ChatInterfaceProps {
  messages: Message[];
  input: string;
  isLoading: boolean;
  onFinish?: () => void;
  handleSubmit: (
    event?: {
      preventDefault?: () => void;
    },
    chatRequestOptions?: ChatRequestOptions
  ) => void;
  handleInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
}

export function ChatInterface({
  messages,
  onFinish,
  input,
  isLoading,
  handleInputChange,
  handleSubmit,
}: ChatInterfaceProps) {
  const userMessageStyle = {
    flexDirection: "row-reverse" as any,
    gap: "10px",
  };

  const botMessageStyle = {
    flexDirection: "",
    gap: "10px",
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Messages */}
        {messages
          .filter((message) => !!message.content)
          .map((message) => (
            <div key={message.id} className="message-container">
              <div
                className={`flex items-start gap-2.5 ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
                style={
                  message.role === "user" ? userMessageStyle : botMessageStyle
                }
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    message.role === "user" ? "bg-blue-500" : "bg-gray-200"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="h-5 w-5 text-white" />
                  ) : (
                    <Bot className="h-5 w-5 text-gray-600" />
                  )}
                </div>
                <div
                  className={`flex max-w-[70%] flex-col ${
                    message.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      message.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-white border border-gray-200"
                    }`}
                    style={{
                      borderTopRightRadius:
                        message.role === "user" ? "4px" : "16px",
                      borderTopLeftRadius:
                        message.role === "user" ? "16px" : "4px",
                    }}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
              <Bot className="h-5 w-5 text-gray-600" />
            </div>
            <div className="flex max-w-[70%] flex-col items-start">
              <div
                className="rounded-2xl border border-gray-200 bg-white px-4 py-2"
                style={{ borderTopLeftRadius: "4px" }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-bounce"></div>
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]"></div>
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="border-t bg-white p-4">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 rounded-full border-gray-200 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-full bg-blue-500 p-2 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
