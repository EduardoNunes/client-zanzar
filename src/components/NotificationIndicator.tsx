import React from 'react';
import Cookies from 'js-cookie';

interface NotificationIndicatorProps {
  className?: string;
  isMenuOpen?: boolean;
}

export const NotificationIndicator: React.FC<NotificationIndicatorProps> = ({ className, isMenuOpen }) => {
  const unreadNotificationsCount = parseInt(Cookies.get('unread_notifications') || '0');

  if (unreadNotificationsCount <= 0) {
    return null;
  }

  return (
    <div
      className={`absolute bottom-7 left-2 bg-red-500 text-white rounded-full w-3 h-3 flex items-center justify-center text-xs ${className}`}
      style={{
        transition: "transform 0.3s ease-in-out",
        transform: "rotate(270deg)"
      }}
    >
      {isMenuOpen ? unreadNotificationsCount : ""}
    </div>
  );
};
