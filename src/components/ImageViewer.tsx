import React, { useEffect, useRef, useState } from "react";

interface ImageViewerProps {
  imageUrl: string;
  onClose: () => void;
}

export default function ImageViewer({ imageUrl, onClose }: ImageViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);
  const [initialDistance, setInitialDistance] = useState<number | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      setInitialDistance(distance);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialDistance !== null) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const newScale = (currentDistance / initialDistance) * scale;
      setScale(newScale);
    }
  };

  const handleTouchEnd = () => {
    setInitialDistance(null);
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center overflow-hidden touch-pan-x touch-pan-y"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 h-full w-full text-white hover:text-gray-300 transition-colors z-[60]"
        onClick={onClose}
      />
      <div
        className="relative w-full h-full flex items-center justify-center overflow-auto"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          ref={imgRef}
          src={imageUrl}
          alt="Fullscreen view"
          className="max-w-full max-h-[95vh] w-auto h-auto object-contain touch-pinch-zoom"
          style={{
            WebkitUserSelect: "none",
            userSelect: "none",
            transform: `scale(${scale})`,
            transition: "transform 0.1s",
          }}
        />
      </div>
    </div>
  );
}
