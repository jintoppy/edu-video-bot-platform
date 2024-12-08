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
      console.log('Received message in iframe:', event.data);
      if (event.data.type === 'CHAT_INITIALIZED') {
        console.log('Received CHAT_INITIALIZED with payload:', event.data.payload);
        setConfig(event.data.payload);
        setInitialized(true);
      }
    };

    console.log('Setting up message listener in iframe');
    window.addEventListener('message', handleMessage);
    
    // Signal to parent that we're ready
    window.parent.postMessage({ type: 'IFRAME_READY' }, '*');
    
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const apiKey = searchParams.get('apiKey');
  const sessionId = searchParams.get('sessionId');
  const mode = searchParams.get('mode');
  const programId = searchParams.get('programId');
  const primaryColor = searchParams.get('primaryColor');
  const fontFamily = searchParams.get('fontFamily');

  if (!apiKey) {
    return <div>API Key is required</div>;
  }

  // Merge URL parameters with received config
  const mergedConfig = {
    ...config,
    settings: {
      ...(config?.settings || {}),
      theme: {
        ...(config?.settings?.theme || {}),
        primaryColor: primaryColor || config?.settings?.theme?.primaryColor,
        fontFamily: fontFamily || config?.settings?.theme?.fontFamily,
      }
    }
  };

  if (!initialized) {
    return <div>Initializing chat...</div>;
  }

  return (
    <div className="h-screen w-full">
      <EmbeddedChat 
        apiKey={apiKey}
        sessionId={sessionId || undefined}
        programId={programId || undefined}
        mode={mode as 'widget' | 'inline'}
        settings={mergedConfig.settings}
        metadata={mergedConfig.metadata}
        theme={mergedConfig.settings?.theme}
      />
    </div>
  );
}
