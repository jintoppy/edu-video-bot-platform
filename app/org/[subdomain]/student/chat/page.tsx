"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { VideoChat } from "@/components/video-chat/video-chat";
import { ChatSidebar } from "@/components/video-chat/chat-sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Loader2, Video, VideoOff, Mic, MicOff } from "lucide-react";
import { textToSpeech } from "@/app/actions/tts";
import { useSearchParams } from "next/navigation";

function Chat() {
  const searchParams = useSearchParams();
  const programId = searchParams.get("programId");
  const [programName, setProgramName] = useState<string | null>(null);
  const chatSidebarRef = useRef<any>(null);

  useEffect(() => {
    setupSpeechRecognition();
    
    return () => {
      if ((window as any).currentRecognition) {
        (window as any).currentRecognition.stop();
      }
    };
  }, []);

  useEffect(() => {
    const fetchProgramDetails = async () => {
      if (programId) {
        try {
          const response = await fetch(`/api/programs/${programId}`);
          const data = await response.json();
          setProgramName(data.name);
        } catch (error) {
          console.error("Error fetching program details:", error);
        }
      }
    };

    fetchProgramDetails();
  }, [programId]);

  const handleNewMessage = (message: any) => {
    if (chatSidebarRef.current) {
      chatSidebarRef.current.addMessage(message);
    }
  };
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [aiMessageToSpeak, setAiMessageToSpeak] = useState("");
  const [audioToSpeak, setAudioToSpeak] = useState<any>(null);

  const toggleCamera = () => {
    setIsCameraEnabled(!isCameraEnabled);
    // Implement camera toggle logic
  };

  const setupSpeechRecognition = () => {
    if ((window as any).currentRecognition) {
      (window as any).currentRecognition.stop();
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const text = event.results[last][0].transcript;

      if (event.results[last].isFinal) {
        const userMessage = {
          id: Date.now().toString(),
          role: "user",
          content: text,
          createdAt: new Date(),
        };
        handleNewMessage(userMessage);
      }
    };

    recognition.start();
    // Store recognition instance for cleanup
    (window as any).currentRecognition = recognition;
  };

  const toggleMic = () => {
    setIsMicEnabled(!isMicEnabled);
    if (!isMicEnabled) {
      setupSpeechRecognition();
    } else {
      if ((window as any).currentRecognition) {
        (window as any).currentRecognition.stop();
      }
    }
  };

  if (isConnecting) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Connecting to video chat...</p>
        </div>
      </div>
    );
  }

  const handleNewAIMessage = async (msg: string) => {
    console.log("handleNewAIMessage", msg);
    setAiMessageToSpeak(msg);
    const audioToSpeak = await textToSpeech(msg);
    if (audioToSpeak && audioToSpeak.success) {
      setAudioToSpeak(audioToSpeak.audioData);
    }
  };

  const handleAudioProcessed = () => {
    setAiMessageToSpeak("");
    setAudioToSpeak(null);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mt-4 flex items-center justify-between">
        {programName ? (
          <div className="mb-4">
            <DashboardHeader
              heading={`Consultation on ${programName}`}
              text="Have a detailed discussion about your selected program"
            />
          </div>
        ) : (
          <DashboardHeader
            heading="AI Counselor"
            text="Educational Guidance Expert"
          />
        )}

        <div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleCamera}
              className={!isCameraEnabled ? "bg-muted" : ""}
            >
              {isCameraEnabled ? (
                <Video className="h-4 w-4" />
              ) : (
                <VideoOff className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleMic}
              className={!isMicEnabled ? "bg-muted" : ""}
            >
              {isMicEnabled ? (
                <Mic className="h-4 w-4" />
              ) : (
                <MicOff className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
      <div className="grid flex-1 gap-4 md:grid-cols-[512px,1fr]">
        <VideoChat
          audioToSpeak={audioToSpeak}
          handleAudioProcessed={handleAudioProcessed}
          isMicEnabled={isMicEnabled}
        />
        <ChatSidebar onNewMessage={handleNewAIMessage} ref={chatSidebarRef} />
      </div>
    </div>
  );
}

export default function ChatPage(){
  return (
    <Suspense>
      <Chat />
    </Suspense>
  )
}
