import { Maximize2, Play } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface VideoProgressBarProps {
  videoElement?: HTMLVideoElement | null;
  onFullscreen?: () => void;
}

const VideoProgressBar: React.FC<VideoProgressBarProps> = ({
  videoElement = null,
  onFullscreen,
}) => {
  const progressRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isVideoPaused, setIsVideoPaused] = useState(true);

  useEffect(() => {
    const video = videoElement;
    const progressBar = progressRef.current;

    if (!video || !progressBar) return;

    // Garante q os controls do video estejam visíveis
    const handleCanPlay = () => {
      setIsControlsVisible(true);
    };

    const updateProgress = () => {
      if (video.duration > 0) {
        const progressPercentage = (video.currentTime / video.duration) * 100;
        setProgress(progressPercentage);
      }
    };

    const handlePlayPauseState = () => {
      setIsVideoPaused(video.paused);
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("play", handlePlayPauseState);
    video.addEventListener("pause", handlePlayPauseState);
    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("ended", () => {
      video.currentTime = 0;
      video.play();
    });

    // Initial state
    setIsVideoPaused(video.paused);

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("play", handlePlayPauseState);
      video.removeEventListener("pause", handlePlayPauseState);
      video.removeEventListener("timeupdate", updateProgress);
      video.removeEventListener("ended", () => {
        video.currentTime = 0;
        video.play();
      });
    };
  }, [videoElement]);

  const toggleVideoPlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoElement;
    if (!video) return;

    if (video.paused) {
      video.play().catch((error) => {
        console.warn("Play failed:", error);
      });
    } else {
      video.pause();
    }
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onFullscreen) {
      onFullscreen();
    }
  };

  if (!videoElement) return null;

  return (
    <div className="absolute inset-0 z-3" onClick={toggleVideoPlayPause}>
      {isControlsVisible && isVideoPaused && (
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          onClick={toggleVideoPlayPause}
        >
          <Play size={64} className="text-white bg-black/50 rounded-full p-3" />
        </div>
      )}

      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-600">
        <div
          ref={progressRef}
          className="h-full bg-white transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="absolute bottom-2 right-2 flex flex-col space-y-2">
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
