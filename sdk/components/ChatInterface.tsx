// app/components/chat-interface.tsx
import React from 'react';
import { Message, useChat } from 'ai/react';
import dynamic from 'next/dynamic';

// Dynamically import UI components
const ProgramList = dynamic(() => import('./ui/program-list'));
const ContactForm = dynamic(() => import('./ui/contact-form'));
const ProfileForm = dynamic(() => import('./ui/profile-form'));

interface ChatInterfaceProps {
  initialMessages?: any[];
  onFinish?: () => void;
}

export function ChatInterface({ initialMessages, onFinish }: ChatInterfaceProps) {
  const { messages, input, handleInputChange, handleSubmit, append, isLoading } = useChat({
    api: '/api/v1/sdk/chat/stream',
    initialMessages,
    onFinish,
  });

  const renderToolInvocation = (toolInvocation: any) => {
    const { toolName, state, result } = toolInvocation;

    // Show loading state
    if (state !== 'result') {
      return <div className="animate-pulse">Processing...</div>;
    }

    // Render different UIs based on tool results
    switch (toolName) {
      case 'classifyQuery':
        const { category, ui } = result;
        switch (category) {
          case 'RECOMMENDATION_REQUEST':
            return <ProfileForm fields={ui.fields} onSubmit={handleProfileSubmit} />;
          case 'HUMAN_COUNSELOR':
            return <ContactForm fields={ui.fields} onSubmit={handleContactSubmit} />;
          default:
            return null;
        }

      case 'showRecommendations':
        return <ProgramList programs={result.ui.programs} onSelect={handleProgramSelect} />;

      default:
        return null;
    }
  };

  const handleProfileSubmit = async (data: any) => {
    // Handle profile form submission
    const message: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: "Here's my profile information: " + JSON.stringify(data)
    };
    
    await append(message);
  };

  const handleContactSubmit = async (data: any) => {
    const message: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: "Please contact me at: " + JSON.stringify(data)
    };
    
    await append(message);
  };

  const handleProgramSelect = async (programId: string) => {
    const message: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `I'm interested in program ${programId}. Can you tell me more about it?`
    };
    
    await append(message);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="message-container">
            {/* Message content */}
            <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'
              }`}>
                {message.content}
              </div>
            </div>

            {/* Tool invocations UI */}
            {message.role === 'assistant' && message.toolInvocations?.map((toolInvocation: any) => (
              <div key={toolInvocation.toolCallId} className="mt-4">
                {renderToolInvocation(toolInvocation)}
              </div>
            ))}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="animate-pulse">Thinking...</div>
            </div>
          </div>
        )}
      </div>

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