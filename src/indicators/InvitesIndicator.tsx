import { useEffect, useRef } from "react";
import { Preferences } from "@capacitor/preferences";
import { useGlobalContext } from "../context/globalContext";
import { useSocket } from "../hooks/useSocket";

interface InvitesIndicatorProps {
  className?: string;
  isMenuOpen?: boolean;
  unreadInvites?: number;
  setUnreadInvites?: React.Dispatch<React.SetStateAction<number>>;
}

export function InvitesIndicator({
  className,
  isMenuOpen,
  unreadInvites = 0,
  setUnreadInvites,
}: InvitesIndicatorProps) {
  const { profileId } = useGlobalContext();
  const socket = useSocket();
  const unreadRef = useRef(unreadInvites);

  useEffect(() => {
    unreadRef.current = unreadInvites;
  }, [unreadInvites]);

  useEffect(() => {
    const fetchUnreadInvites = async () => {
      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      const result = isMobile
        ? await Preferences.get({ key: "invites" })
        : { value: localStorage.getItem("invites") };

      const parsed = result.value ? parseInt(result.value, 10) : 0;
      setUnreadInvites?.(parsed);
    };

    fetchUnreadInvites();
  }, [isMenuOpen, setUnreadInvites]);

  useEffect(() => {
    if (!socket || !profileId) return;

    const eventName = `invite:new:${profileId}`;

    const handleNewInvite = async () => {
      const newUnread = unreadRef.current + 1;
      setUnreadInvites?.(newUnread);

      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      const value = newUnread.toString();
      if (isMobile) {
        await Preferences.set({ key: "invites", value });
      } else {
        localStorage.setItem("invites", value);
      }
    };

    socket.on(eventName, handleNewInvite);

    // Solicita contagem inicial
    socket.emit("get-unread-invites", profileId);

    return () => {
      socket.off(eventName, handleNewInvite);
    };
  }, [socket, profileId, setUnreadInvites]);

  if (unreadInvites === 0) return null;

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
}
