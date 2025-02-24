import React from 'react';
import Cookies from 'js-cookie';

interface InvitesIndicatorProps {
  className?: string;
  isMenuOpen?: boolean;
  invitesCount?: number;
}

export const InvitesIndicator: React.FC<InvitesIndicatorProps> = ({ className, isMenuOpen, invitesCount }) => {
  const unreadInvitesCount = parseInt(Cookies.get('invites') || '0');

  if (unreadInvitesCount <= 0) {
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
      {invitesCount ? invitesCount : 
      isMenuOpen ? unreadInvitesCount : ""}
    </div>
  );
};
