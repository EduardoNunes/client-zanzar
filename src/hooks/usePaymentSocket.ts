import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../server/socket";

export function usePaymentSocket(
  profileId: any,
  onPaymentConfirmed: () => void
) {
  const socketRef = useRef<Socket | null>(null);
  const profileIdSocket = profileId;

  useEffect(() => {
    if (!profileIdSocket) {
      console.warn("profileIdSocket ausente");
      return;
    }

    // Se ainda não conectou
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        query: { profileIdSocket },
      });

      socketRef.current.on("connect", () => {});

      socketRef.current.on("payment-confirmed", () => {
        onPaymentConfirmed();
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("payment-confirmed");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [profileIdSocket, onPaymentConfirmed]);
}
