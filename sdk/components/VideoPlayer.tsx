import React from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  hlsUrl: string;
  mp4Url: string;
}

export function VideoPlayer({ hlsUrl, mp4Url }: VideoPlayerProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (!videoRef.current) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(hlsUrl);
      hls.attachMedia(videoRef.current);
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari
      videoRef.current.src = hlsUrl;
    } else {
      // Fallback to MP4
      videoRef.current.src = mp4Url;
    }
  }, [hlsUrl, mp4Url]);

  return (
    <video 
      ref={videoRef}
      controls
      className="w-full rounded-lg"
      style={{ maxWidth: '320px' }}
    />
  );
}
