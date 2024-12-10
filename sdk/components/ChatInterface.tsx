// app/components/chat-interface.tsx
import React, { useState } from "react";
import { Message, useChat } from "ai/react";
import { VideoPlayer } from "./VideoPlayer";
import { ChatRequestOptions, JSONValue } from "ai";

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

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Messages */}
        {messages.map((message) => (
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
                
              </div>
            </div>
          </div>
        ))}
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
    </div>
  );
}
