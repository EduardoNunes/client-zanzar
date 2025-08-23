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
    if (!profileId || !token) return;

    // Cria socket apenas uma vez
    if (!socketInstance) {
      console.log("Criando nova conexão socket:", profileId);

      socketInstance = io(SOCKET_URL, {
        auth: { profileId, token },
        autoConnect: true,
        reconnection: true,
        transports: ["websocket"],
      });

      // Listeners adicionados apenas na criação
      socketInstance.on("connect", () => {
        console.log(
          "✅ Socket conectado!",
          socketInstance?.id,
          "profileId:",
          profileId
        );
      });

      socketInstance.on("payment-confirmed", () => {
        console.log("💰 Pagamento confirmado recebido no front!");
        toast.success("Pagamento confirmado!");
      });

      socketInstance.on("notification", (data: any) => {
        console.log("🔔 Notificação recebida:", data);
        toast.info(data.message || "Nova notificação");
      });

      socketInstance.on("connect_error", (err) => {
        console.error("❌ Erro ao conectar socket:", err);
      });
    }

    // Atribui a referência local
    socketRef.current = socketInstance;

    // Cleanup só limpa referência local (não remove listeners do singleton)
    return () => {
      socketRef.current = null;
    };
  }, [profileId, token]);

  return socketRef.current;
};
