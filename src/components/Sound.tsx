import { VolumeX, Volume1, Volume2 } from "lucide-react";

interface SoundProps {
  isVideoMuted: boolean;
  setIsVideoMuted: (isVideoMuted: boolean) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export default function Sound({
  isVideoMuted,
  setIsVideoMuted,
  videoRef,
}: SoundProps) {
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;

    if (!video) return;

    if (video.muted) {
      video.muted = false;
      video.volume = 1;
      setIsVideoMuted(false);
    } else {
      video.muted = true;
      setIsVideoMuted(true);
    }
  };

  const getVolumeIcon = () => {
    if (!videoRef.current) return <VolumeX size={24} />;

    if (isVideoMuted) return <VolumeX size={24} />;

    const volume = videoRef.current.volume;
    if (volume === 0) return <VolumeX size={24} />;
    if (volume < 0.5) return <Volume1 size={24} />;
    return <Volume2 size={24} />;
  };
  return (
    <>
      <button
        className="bg-black/50 text-white p-2 rounded-full z-10"
        onClick={toggleMute}
      >
        {getVolumeIcon()}
      </button>
    </>
  );
}
