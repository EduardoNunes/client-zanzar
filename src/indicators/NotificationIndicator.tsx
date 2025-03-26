import React from "react";
import { useGlobalContext } from "../context/globalContext";

interface NotificationIndicatorProps {
  className?: string;
  isMenuOpen?: boolean;
}

export const NotificationIndicator: React.FC<NotificationIndicatorProps> = ({
  className,
  isMenuOpen,
}) => {
  const { unreadNotifications } = useGlobalContext();

  if (!unreadNotifications || unreadNotifications <= 0) {
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
      {isMenuOpen ? unreadNotifications : ""}
    </div>
  );
};
