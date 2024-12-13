"use client";

import React, { useEffect, useState } from "react";
import { EmbeddedChat } from "@/sdk/components/EmbeddedChat";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Suspense } from "react";

interface PageProps {
  searchParams: { [key: string]: string | undefined };
}

const DEFAULT_CONFIG = {
  sessionId: "bb454f42-b35c-46fb-9cb7-f752f9a6ed3e",
  orgId: "1ea50628-2746-46a6-a292-dcb60e73ccfc",
  settings: {
    greeting: "👋 Need help choosing a program?",
    autoOpen: true,
    delay: 2000,
    title: "Student Counseling",
    subtitle: "Typically replies within an hour",
    position: "bottom-right",
    theme: {
      primaryColor: "#3B82F6",
      secondaryColor: "#10B981",
      accentColor: "#6366F1",
      fontFamily: "Inter",
    },
    features: {
      videoBot: true,
      liveChat: true,
    },
  },
};

function EmbeddedChatPageComp() {
  const searchParams = useSearchParams();
  const [initialized, setInitialized] = React.useState(false);
  const [config, setConfig] = React.useState<typeof DEFAULT_CONFIG | null>(null);

  React.useEffect(() => {
    let mounted = true;
    // Listen for initialization message from parent
    const handleMessage = (event: MessageEvent) => {
      if (!mounted) return;

      if (event.data.type === "CHAT_INITIALIZED") {
        console.log(
          "Received CHAT_INITIALIZED with payload:",
          event.data.payload
        );
        setConfig(event.data.payload);
        setInitialized(true);
      }
    };

    console.log("Setting up message listener in iframe");
    window.addEventListener("message", handleMessage);

    // Signal to parent that we're ready
    if (window.parent !== window) {
      window.parent.postMessage({ type: "IFRAME_READY" }, "*");
    }

    return () => {
      mounted = false;
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const apiKey = searchParams.get("apiKey");
  const sessionId = searchParams.get("sessionId");
  const mode = searchParams.get("mode");
  const programId = searchParams.get("programId");
  const primaryColor = searchParams.get("primaryColor");
  const fontFamily = searchParams.get("fontFamily");

  const [mergedConfig, setMergedConfig] = React.useState<typeof DEFAULT_CONFIG | null>(null);

  React.useEffect(() => {
    if (!config) {
      setConfig(DEFAULT_CONFIG);
      return;
    }

    if (!apiKey) {
      return;
    }

    // Merge URL parameters with received config
    const newMergedConfig = {
      ...config,
      settings: {
        ...(config?.settings || {}),
        theme: {
          ...(config?.settings?.theme || {}),
          primaryColor: primaryColor || config?.settings?.theme?.primaryColor,
          fontFamily: fontFamily || config?.settings?.theme?.fontFamily,
        },
      },
    };

    setMergedConfig(newMergedConfig);
    setInitialized(true);
  }, [config, apiKey, primaryColor, fontFamily]);

  if (!apiKey) {
    return <div>API Key is required</div>;
  }

  if (!initialized || !mergedConfig) {
    return <div>Initializing chat...</div>;
  }

  return (
    <div className="h-screen w-full relative">
      <button
        onClick={() => window.parent.postMessage({ type: "CHAT_CLOSE" }, "*")}
        className="absolute top-4 right-4 z-50 p-2 rounded-full hover:bg-gray-100"
      >
        <X className="w-5 h-5" />
      </button>
      <EmbeddedChat
        apiKey={apiKey}
        orgId={mergedConfig.orgId}
        sessionId={mergedConfig.sessionId || undefined}
        programId={programId || undefined}
        mode={mode as "widget" | "inline"}
        settings={mergedConfig?.settings}
        metadata={mergedConfig?.metadata}
        theme={mergedConfig?.settings?.theme}
        onClose={() => {}}
      />
    </div>
  );
}

export default function EmbeddedChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmbeddedChatPageComp />
    </Suspense>
  );
}
