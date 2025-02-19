import React, { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX, Maximize2, Volume1 } from 'lucide-react';

interface VideoProgressBarProps {
  videoElement?: HTMLVideoElement | null;
  onFullscreen?: () => void;
}

const VideoProgressBar: React.FC<VideoProgressBarProps> = ({
  videoElement = null,
  onFullscreen
}) => {
  const progressRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoElement;
    const progressBar = progressRef.current;

    if (!video || !progressBar) return;

    const updateProgress = () => {
      if (video.duration > 0) {
        const progressPercentage = (video.currentTime / video.duration) * 100;
        setProgress(progressPercentage);
      }
    };

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('ended', () => {
      video.currentTime = 0;
      video.play();
    });

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('ended', () => {
        video.currentTime = 0;
        video.play();
      });
    };
  }, [videoElement]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoElement;
    if (!video) return;

    if (video.muted) {
      video.muted = false;
      video.volume = 1;
    } else {
      video.muted = true;
    }
  };

  const toggleVideoPlayPause = () => {
    const video = videoElement;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const getVolumeIcon = () => {
    if (!videoElement) return <VolumeX size={24} />;

    if (videoElement.muted) return <VolumeX size={24} />;

    const volume = videoElement.volume;
    if (volume === 0) return <VolumeX size={24} />;
    if (volume < 0.5) return <Volume1 size={24} />;
    return <Volume2 size={24} />;
  };

  const handleFullscreen = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (onFullscreen) {
      onFullscreen();
    }
  };

  if (!videoElement) return null;

  return (
    <div
      className="absolute inset-0 z-10"
      onClick={toggleVideoPlayPause}
    >
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-300">
        <div
          ref={progressRef}
          className="h-full bg-white transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
      {videoElement.paused && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 text-white px-4 py-2 rounded-lg">
          Paused
        </div>
      )}
      <div className="absolute bottom-2 right-2 flex flex-col space-y-2">
        <button
          onClick={toggleMute}
          className="bg-black/50 text-white p-2 rounded-full"
        >
          {getVolumeIcon()}
        </button>
        {onFullscreen && (
          <button
            onClick={handleFullscreen}
            className="bg-black/50 text-white p-2 rounded-full"
          >
            <Maximize2 size={24} />
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoProgressBar;
