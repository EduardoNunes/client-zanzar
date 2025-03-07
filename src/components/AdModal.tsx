import Cookies from "js-cookie";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Advertisement,
  getEligibleAdReq,
  recordAdClickReq,
} from "../requests/adModalReq";

export default function AdModal() {
  const [ad, setAd] = useState<Advertisement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hasShownAd, setHasShownAd] = useState(false);
  const [showCloseButton, setShowCloseButton] = useState(false);
  const loading = useRef(false); // UseRef para evitar chamadas duplicadas

  useEffect(() => {
    if (!hasShownAd && !loading.current) {
      loading.current = true; // Marca que a requisição começou
      checkAndShowAd();
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setShowCloseButton(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const checkAndShowAd = async () => {
    try {
      const profileId = Cookies.get("profile_id");
      const eligibleAd = await getEligibleAdReq(profileId);

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
      const profileId = Cookies.get("profile_id");
      try {
        await recordAdClickReq(ad.id, profileId);
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
        {/* Header - Fixed */}
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

        {/* Content - Scrollable */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* Media */}
          <div className="mb-4">
            {ad.mediaType === "image" ? (
              <img
                src={ad.mediaUrl}
                alt={ad.title}
                className="w-full h-auto rounded-lg"
              />
            ) : (
              <video
                src={ad.mediaUrl}
                controls
                className="w-full h-auto rounded-lg"
              />
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-4">{ad.description}</p>

          {/* Link */}
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
