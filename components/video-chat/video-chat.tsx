"use client";

import { Room } from "livekit-client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SimliClient } from "simli-client";
import { useEffect, useRef, useState } from "react";

interface VideoChatProps {
  audioToSpeak: any;
  handleAudioProcessed: () => void;
  isMicEnabled?: boolean;
}

const simliClient = new SimliClient();

export function VideoChat({
  audioToSpeak,
  handleAudioProcessed,
  isMicEnabled = false,
}: VideoChatProps) {
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const isSimliInitialised = useRef(false);
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current && videoRef.current && !isSimliInitialised.current) {
      const SimliConfig = {
        apiKey: process.env.NEXT_PUBLIC_SIMLI_API_KEY!,
        faceID: process.env.NEXT_PUBLIC_SIMLI_FACE_ID!,
        handleSilence: true,
        maxSessionLength: 3600, // in seconds
        maxIdleTime: 600, // in seconds
        videoRef: videoRef,
        audioRef: audioRef,
      };

      simliClient.Initialize(SimliConfig);

      isSimliInitialised.current = true;

      setTimeout(() => {
        simliClient.start();
      }, 4000);

      simliClient.on('connected', () => {
        console.log('SimliClient connected');
        const audioData = new Uint8Array(6000).fill(0);
        simliClient.sendAudioData(audioData);
      });

      console.log("Simli Client initialized");      
    }
  }, [audioRef, videoRef, isSimliInitialised]);


  // Handle AI speech
  useEffect(() => {
    if (audioToSpeak) {
      const audioArray = new Uint8Array(audioToSpeak);
      console.log("audioArray", audioArray);
      console.log("audioArray length", audioArray.length);
      const chunkSize = 2048;
      for (let i = 0; i < audioArray.length; i += chunkSize) {
        const chunk = audioArray.slice(i, i + chunkSize);
        simliClient.sendAudioData(chunk);
      }
      handleAudioProcessed();
    }
  }, [audioToSpeak]);

  return (
    <Card className="flex flex-col h-[512px] overflow-hidden">
      <div className="relative flex-1 bg-muted">
        {/* Video elements will be inserted here by LiveKit */}
        <div id="video-container" className="h-full flex items-center flex-col">
          <video ref={videoRef} autoPlay playsInline></video>
          <audio ref={audioRef} autoPlay></audio>
        </div>
      </div>
    </Card>
  );
}
