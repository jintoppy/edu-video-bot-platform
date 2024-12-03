"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUser } from '@clerk/clerk-react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uuid } from "uuidv4";
import { chatAction } from "@/app/actions/graph";
import { cn } from "@/lib/utils";

interface ExtendedMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: Date;
  ui?: React.ReactNode;
  sessionId?: string;
  queryType?: string;
};

type Props = {
  onNewMessage: (msg: string) => void;
};

export interface ChatSidebarRef {
  addMessage: (message: ExtendedMessage) => void;
}

export const ChatSidebar = forwardRef<ChatSidebarRef, Props>(({ onNewMessage }, ref) => {
  const [input, setInput] = useState("");
  const { toast } = useToast();
  const { user } = useUser();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [serverUI, setServerUI] = useState<React.ReactNode | null>(null);

  const [messages, setMessages] = useState<ExtendedMessage[]>([
    {
      id: uuid(),
      content:
        "Hello! I'm your AI educational counselor. How can I help you today?",
      role: "assistant",
      createdAt: new Date(),
    },
  ]);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch('/api/users/me');
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      setUserId(data.user.id);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Failed to initialize chat. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    const handleUIActions = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const action = target.getAttribute("data-action");
      if (action) {
        const programId = target.getAttribute("data-program-id");
        switch (action) {
          case "learn-more":
            // Handle learn more
            break;
          case "compare":
            // Handle compare
            break;
          case "enroll":
            // Handle enrollment
            break;
          case "refine-search":
            // Handle search refinement
            break;
        }
      }
    };

    document.addEventListener("click", handleUIActions);
    return () => document.removeEventListener("click", handleUIActions);
  }, []);

  const handleSend = async (msg?: string) => {
    if ((!input.trim() && !msg) || isLoading) return;

    try {
      setIsLoading(true);
      const userInput = msg ?? input;

      // Create plain message object
      const userMessage: ExtendedMessage = {
        id: uuid(),
        content: userInput,
        role: "user",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setServerUI(null);

      const loadingId = uuid();
      setMessages((prev) => [
        ...prev,
        {
          id: loadingId,
          content: "",
          role: "assistant",
          createdAt: new Date(),
        },
      ]);

      // Convert messages to plain objects
      const serializedMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        id: msg.id,
      }));

      if (!userId) {
        throw new Error("User ID not available");
      }
      
      const combinedResponse = chatAction(serializedMessages, userInput, userId);

      setServerUI((await combinedResponse).serverUi);
      const response = await (await combinedResponse).resultPromise;
      const lastMessage = response.messages[response.messages.length - 1];
      if(lastMessage.role === 'assistant'){
        onNewMessage(lastMessage.content.toString());
      }
      

      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== loadingId);
        if (response.messages[response.messages.length - 1]) {
          const lastMessage = response.messages[response.messages.length - 1];
          return [
            ...filtered,
            {
              id: uuid(),
              content: lastMessage.queryType === 'GENERAL_QUESTION'? 'Details Below' : lastMessage.content,
              role: "assistant",
              createdAt: new Date(),
            },
          ];
        }
        return filtered;
      });
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
      setMessages((prev) =>
        prev.filter((m) => m.id !== prev[prev.length - 1].id)
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useImperativeHandle(ref, () => ({
    addMessage: (message: ExtendedMessage) => {
      setInput(message.content);
      handleSend(message.content);
      // setMessages(prev => [...prev, message]); 
    }
  }));

  return (
    <Card className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Educational Counselor</h3>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, i) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "rounded-lg px-4 py-2 max-w-[85%] space-y-2",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {/* Message Content */}
                <div className="prose prose-sm dark:prose-invert">
                  {message.content || (
                    <div className="flex space-x-1 animate-pulse">
                      <div className="w-2 h-2 bg-current rounded-full" />
                      <div className="w-2 h-2 bg-current rounded-full" />
                      <div className="w-2 h-2 bg-current rounded-full" />
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                {message.createdAt && (
                  <div className="text-xs opacity-70">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          ))}
          {serverUI}
        </div>
      </ScrollArea>

      <form onSubmit={(e) => {
        e.preventDefault();
        handleSend();
      }} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
          >
            <Send className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>
      </form>
    </Card>
  );
})

ChatSidebar.displayName = 'ChatSidebar';
