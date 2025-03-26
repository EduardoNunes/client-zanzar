import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Advertisement,
  getEligibleAdReq,
  recordAdClickReq,
} from "../requests/adModalReq";
import VideoProgressBar from "./VideoProgressBar";
import { useGlobalContext } from "../context/globalContext";

export default function AdModal() {
  const { token, profileId, isLoadingToken } = useGlobalContext();
  const [ad, setAd] = useState<Advertisement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hasShownAd, setHasShownAd] = useState(false);
  const [showCloseButton, setShowCloseButton] = useState(false);
  const loading = useRef(false); // UseRef para evitar chamadas duplicadas
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoRefsState, setVideoRefsState] = useState<HTMLVideoElement | null>(
    null
  );

  useEffect(() => {
    if (!hasShownAd && !loading.current && !isLoadingToken) {
      loading.current = true; // Marca que a requisição começou
      checkAndShowAd();
    }
  }, [isLoadingToken]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setShowCloseButton(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const checkAndShowAd = async () => {
    if (!token) {
      console.error("Token not found");
      return;
    }
    try {
      const eligibleAd = await getEligibleAdReq(profileId, token);

      if (!eligibleAd) return;

      setAd(eligibleAd);
      setIsOpen(true);
      setHasShownAd(true);
    } catch (error) {
      console.error("Error in checkAndShowAd:", error);
    } finally {
      loading.current = false; // Reseta a flag após a requisição terminar
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleClick = async () => {
    if (ad && ad.linkUrl) {
      try {
        await recordAdClickReq(ad.id, profileId, token);
        window.open(ad.linkUrl, "_blank");
      } catch (error) {
        console.error("Error recording ad click:", error);
      } finally {
        handleClose();
      }
    }
  };

  if (!isOpen || !ad) return null;

  return (
    <div className="fixed inset-0 bg-white/10 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">{ad.title}</h2>
          {showCloseButton && (
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          <div className="mb-4 relative w-full">
            {ad.mediaType === "image" ? (
              <img
                src={ad.mediaUrl}
                alt={ad.title}
                className="w-full h-auto rounded-lg"
              />
            ) : (
              <div className="relative w-full">
                {videoLoading && (
                  <div className="absolute inset-0 z-20 flex justify-center items-center bg-gray-100/50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                  </div>
                )}
                <video
                  ref={(el) => {
                    videoRef.current = el;
                    if (el) {
                      el.addEventListener("loadedmetadata", () => {
                        setVideoRefsState(el);
                      });
                      el.addEventListener("loadeddata", () => {
                        setVideoLoading(false);
                      });
                      el.play().catch((error) => {
                        console.warn("Autoplay was blocked", error);
                      });
                    }
                  }}
                  src={ad.mediaUrl}
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-auto rounded-lg"
                />
                <VideoProgressBar videoElement={videoRefsState} />
              </div>
            )}
          </div>
          <p className="text-gray-600 mb-4">{ad.description}</p>
          {ad.linkUrl && (
            <a
              href={ad.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClick}
              className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Saiba Mais!
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
