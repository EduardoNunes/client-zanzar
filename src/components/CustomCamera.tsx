import { X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

interface CustomCameraProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

export const CustomCamera: React.FC<CustomCameraProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  useEffect(() => {
    // Start camera when component mounts
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment' 
          }, 
          audio: true 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      } catch (err) {
        toast.error('Erro ao acessar a câmera');
        console.error('Camera access error:', err);
        onClose();
      }
    };

    startCamera();

    // Cleanup function
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [onClose]);

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' });
          onCapture(file);
        }
      }, 'image/jpeg', 0.9);
    }
  };

  const startVideoRecording = () => {
    if (streamRef.current) {
      chunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(streamRef.current);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const file = new File([blob], 'captured-video.webm', { type: 'video/webm' });
        onCapture(file);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Stop recording after 15 seconds
      setTimeout(() => {
        stopVideoRecording();
      }, 15000);
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const startPressTimer = () => {
    isLongPressRef.current = false;
    pressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      startVideoRecording();
    }, 500); // 500ms to distinguish between tap and hold
  };

  const handleMouseDown = () => {
    startPressTimer();
  };

  const handleMouseUp = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
    }
    
    if (!isLongPressRef.current) {
      capturePhoto();
    } else {
      stopVideoRecording();
    }
    
    isLongPressRef.current = false;
  };

  const handleMouseLeave = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="relative flex-grow">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted
          className="w-full h-full object-cover"
        />
        
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 bg-white/30 rounded-full p-2"
        >
          <X className="text-white" />
        </button>
      </div>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <button
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className={`w-20 h-20 rounded-full border-4 ${
            isRecording 
              ? 'bg-red-500 border-red-700' 
              : 'bg-white border-gray-300'
          } transition-colors duration-200`}
        >
          {isRecording && (
            <span className="absolute inset-0 flex items-center justify-center text-white text-sm">
              {/* Optional: Add recording timer */}
              15s
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
