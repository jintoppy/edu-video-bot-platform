import React from 'react';
import ReactHlsPlayer from 'react-hls-player';

interface VideoPlayerProps {
  hlsUrl: string;
  mp4Url: string;
}

export function VideoPlayer({ hlsUrl, mp4Url }: VideoPlayerProps) {
  return (
    <ReactHlsPlayer
      src={hlsUrl}
      fallback={<video src={mp4Url} controls className="w-full rounded-lg" style={{ maxWidth: '320px' }} />}
      autoPlay={false}
      controls={true}
      width="100%"
      height="auto"
      className="w-full rounded-lg"
      style={{ maxWidth: '320px' }}
    />
  );
}
