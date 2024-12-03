"use client";

import React, { useState, useEffect } from "react";
import { DashboardShell } from "@/components/dashboard/shell";
import { DashboardHeader } from "@/components/dashboard/header";
import { ConversationDetails } from "@/components/admin/conversation-details";

interface ChatSession {
  id: string;
  studentId: string;
  communicationMode: string;
  category: string;
  startTime: string;
  endTime: string | null;
  summary: string | null;
  status: string;
  user?: {
    fullName: string;
    email: string;
  };
}

export default function ConversationPage({ params }: { params: { id: string } }) {
  const [conversation, setConversation] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const response = await fetch(`/api/conversations/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch conversation');
        }
        const data = await response.json();
        setConversation(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [params.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !conversation) {
    return <div>Error: {error || 'Conversation not found'}</div>;
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Conversation Details"
        text={`Viewing conversation with ${conversation.user?.fullName || 'Unknown'}`}
      />
      <ConversationDetails conversation={conversation} />
    </DashboardShell>
  );
}
