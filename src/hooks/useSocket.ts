import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "../server/socket";
import { useGlobalContext } from "../context/globalContext";
import { toast } from "react-toastify";

// Socket singleton global
let socketInstance: Socket | null = null;

export const useSocket = (): Socket | null => {
  const { profileId, token } = useGlobalContext();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!profileId || !token) {
      console.warn("profileId ou token ausente, socket não será criado");
      return;
    }

    // Cria socket apenas uma vez
    if (!socketInstance) {
      console.log("Criando nova conexão socket para profileId:", profileId);

      socketInstance = io(SOCKET_URL, {
        auth: { profileId, token },
        transports: ["websocket"],
      });

      socketInstance.on("connect", () => {
        console.log("✅ Socket conectado!", socketInstance?.id);
      });

      socketInstance.on("payment-confirmed", () => {
        console.log("💰 Pagamento confirmado recebido no front!");
        toast.success("Pagamento confirmado!");
      });

      socketInstance.on("notification", (data) => {
        console.log("🔔 Notificação recebida:", data);
        toast.info(data.message || "Nova notificação");
      });

      socketInstance.on("connect_error", (err) => {
        console.error("❌ Erro ao conectar socket:", err);
      });
    }

    socketRef.current = socketInstance;

    // Cleanup: remove listeners específicos do componente
    return () => {
      if (socketRef.current) {
        socketRef.current.off("payment-confirmed");
        socketRef.current.off("notification");
        socketRef.current.off("connect");
        socketRef.current.off("connect_error");
      }
    };
  }, [profileId, token]);

  return socketRef.current;
};
