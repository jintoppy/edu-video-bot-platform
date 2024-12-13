interface VideoBoxProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const VideoBox = ({ videoRef, audioRef }: VideoBoxProps) => {
  return (
    <div className="aspect-video flex rounded-sm overflow-hidden items-center h-[350px] w-[350px] justify-center bg-gray-100">
      <video ref={videoRef} autoPlay playsInline></video>
      <audio ref={audioRef} autoPlay></audio>
    </div>
  );
};

export default VideoBox;
