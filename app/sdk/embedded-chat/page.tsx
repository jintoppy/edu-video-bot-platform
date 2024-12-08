'use client';

import React, { useEffect, useState } from 'react';
import { EmbeddedChat } from '@/sdk/components/EmbeddedChat';
import { useSearchParams } from 'next/navigation';

interface PageProps {
  searchParams: { [key: string]: string | undefined };
}

export default function EmbeddedChatPage() {
  const searchParams = useSearchParams();
  const [initialized, setInitialized] = useState(false);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    // Listen for initialization message from parent
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'CHAT_INITIALIZED') {
        setConfig(event.data.payload);
        setInitialized(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const apiKey = searchParams.get('apiKey');
  const sessionId = searchParams.get('sessionId');
  const mode = searchParams.get('mode');
  const programId = searchParams.get('programId');

  if (!apiKey) {
    return <div>API Key is required</div>;
  }

  if (!initialized || !config) {
    return <div>Initializing chat...</div>;
  }

  return (
    <div className="h-screen w-full">
      <EmbeddedChat 
        apiKey={apiKey}
        sessionId={sessionId || undefined}
        programId={programId || undefined}
        mode={mode as 'widget' | 'inline'}
        settings={config.settings}
        metadata={config.metadata}
      />
    </div>
  );
}