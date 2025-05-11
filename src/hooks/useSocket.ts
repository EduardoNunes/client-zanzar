import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../server/socket";
import { useGlobalContext } from "../context/globalContext";

export const useSocket = () => {
  const { profileId, token } = useGlobalContext();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (profileId && !socketRef.current) {
      const socket = io(SOCKET_URL, {
        query: { userId: profileId },
        auth: { token },
      });

      socket.on("connect_error", (err) => {
        console.error("Erro ao conectar socket:", err);
      });

      socketRef.current = socket;
    }

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [profileId, token]);

  return socketRef.current;
};
