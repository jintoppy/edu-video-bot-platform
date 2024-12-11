// @ts-nocheck
import React, { useRef } from "react";
import ReactHlsPlayer from "@gumlet/react-hls-player";

interface VideoPlayerProps {
  hlsUrl: string;
  mp4Url: string;
}

export function VideoPlayer({ hlsUrl, mp4Url }: VideoPlayerProps) {

  return (
    <ReactHlsPlayer
      src={hlsUrl}
      autoPlay={true}
      controls={true}     
      width="100%"
      height="auto"
      className="w-full rounded-lg"
    />
  );
}
