import React from "react";
import { useGlobalContext } from "../context/globalContext";

interface InvitesIndicatorProps {
  className?: string;
  isMenuOpen?: boolean;
  invitesCount?: number;
}

export const InvitesIndicator: React.FC<InvitesIndicatorProps> = ({
  className,
  isMenuOpen,
  invitesCount,
}) => {
  const { invites } = useGlobalContext();

  if (!invites || invites <= 0) {
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
      {invitesCount ? invitesCount : isMenuOpen ? invites : ""}
    </div>
  );
};
