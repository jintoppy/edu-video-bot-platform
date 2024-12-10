import React from 'react';
import ReactHlsPlayer from 'react-hls-player';

interface VideoPlayerProps {
  hlsUrl: string;
  mp4Url: string;
}

export function VideoPlayer({ hlsUrl, mp4Url }: VideoPlayerProps) {
  const playerRef = React.useRef(null);
  return (
    <ReactHlsPlayer
      src={hlsUrl}
      playerRef={playerRef}
      autoPlay={true}
      controls={true}
      width="100%"
      height="auto"
      className="w-full rounded-lg"
      style={{ maxWidth: '320px' }}
    />
  );
}
