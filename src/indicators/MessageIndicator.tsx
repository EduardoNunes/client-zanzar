import React from "react";
import { useGlobalContext } from "../context/globalContext";

interface MessageIndicatorProps {
  className?: string;
  isMenuOpen?: boolean;
  messagesCount?: number;
}

export const MessageIndicator: React.FC<MessageIndicatorProps> = ({
  className,
  isMenuOpen,
  messagesCount,
}) => {
  const { unreadChatMessages } = useGlobalContext();

  if (!unreadChatMessages || unreadChatMessages <= 0) {
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
      {messagesCount ? messagesCount : isMenuOpen ? unreadChatMessages : ""}
    </div>
  );
};
