import { Preferences } from "@capacitor/preferences";
import React, { useEffect } from "react";

interface InvitesIndicatorProps {
  className?: string;
  isMenuOpen?: boolean;
  unreadInvites?: number;
  setUnreadInvites?: (unreadInvites: number) => void;
}

export const InvitesIndicator: React.FC<InvitesIndicatorProps> = ({
  className,
  isMenuOpen,
  unreadInvites,
  setUnreadInvites,
}) => {
  useEffect(() => {
    const fetchUnreadInvites = async () => {
      let invitesStorage;

      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      if (isMobile) {
        const result = await Preferences.get({ key: "invites" });
        invitesStorage = result.value;
      } else {
        invitesStorage = localStorage.getItem("invites");
      }

      if (setUnreadInvites) {
        const parsedValue = invitesStorage ? parseInt(invitesStorage, 10) : 0;
        setUnreadInvites(parsedValue);
      }
    };

    fetchUnreadInvites();
  }, [isMenuOpen, setUnreadInvites]);

  if (!unreadInvites || unreadInvites <= 0) {
    return null;
  }

  return (
    <div
      className={`absolute bottom-7 left-2 bg-red-500 text-white rounded-full w-3 h-3 flex items-center justify-center text-xs ${className}`}
      style={{
        transition: "transform 0.3s ease-in-out",
        transform: "rotate(270deg)",
      }}
    >
      {unreadInvites}
    </div>
  );
};
