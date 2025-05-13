import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { formatDistanceToNow } from "date-fns";
import { Send, X } from "lucide-react";
import { getMessagesReq } from "../requests/chatRequests";
import { SOCKET_URL } from "../server/socket";
import { useGlobalContext } from "../context/globalContext";
import { ptBR } from "date-fns/locale";

interface Message {
  profileId: string;
  id: string;
  content: string;
  createdAt: string;
  profile: {
    username: string;
    avatarUrl: string | null;
  };
}

interface ChatModalProps {
  conversationId: string;
  onClose: () => void;
  currentUser: string;
}

export default function ChatModal({
  conversationId,
  onClose,
  currentUser,
}: ChatModalProps) {
  const { token } = useGlobalContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [offset, setOffset] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const socket = io(SOCKET_URL);

  // Variável para controlar se devemos rolar automaticamente para o final
  const shouldScrollToBottom = useRef(true);

  useEffect(() => {
    socket.emit("joinChat", { conversationId });
    readAllMessages();

    // Mark conversation as read when opening chat
    socket.emit("openChat", {
      conversationId,
      profileId: currentUser,
    });

    const handleNewMessage = (message: Message) => {
      // Adiciona a nova mensagem ao final da lista
      setMessages((prev) => [...prev, message]);

      // Automatically mark conversation as read when receiving a new message
      socket.emit("openChat", {
        conversationId,
        profileId: currentUser,
      });

      scrollToBottom();
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.emit("leaveChat", { conversationId });
      socket.off("newMessage", handleNewMessage);
    };
  }, [conversationId, currentUser]);

  useEffect(() => {
    if (shouldScrollToBottom.current && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (conversationId && socket) {
      socket.on("conversationRead", (readResult) => {
        console.log("Conversation marked as read:", readResult);
      });

      return () => {
        socket.off("conversationRead");
      };
    }
  }, [conversationId, socket]);

  const readAllMessages = async () => {
    setLoading(true);
    try {
      const initialMessages = await getMessagesReq(
        conversationId,
        15,
        0,
        token
      );
      // Verifica a ordem das mensagens recebidas pelo backend
      const orderedMessages = isDescendingOrder(initialMessages)
        ? initialMessages.reverse()
        : initialMessages;
      setMessages(orderedMessages);
      setOffset(15);
      setHasMoreMessages(initialMessages.length === 15);
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!hasMoreMessages || loading) return;
    setLoading(true);
    try {
      const additionalMessages = await getMessagesReq(
        conversationId,
        15,
        offset,
        token
      );
      if (additionalMessages.length > 0) {
        // Verifica a ordem das mensagens recebidas pelo backend
        const orderedMessages = isDescendingOrder(additionalMessages)
          ? additionalMessages.reverse()
          : additionalMessages;

        // Desativa o scroll automático ao carregar mais mensagens
        shouldScrollToBottom.current = false;

        setMessages((prev) => [...orderedMessages, ...prev]);
        setOffset((prev) => prev + 15);
        setHasMoreMessages(additionalMessages.length === 15);
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error("Erro ao carregar mais mensagens:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = event.currentTarget;
    if (scrollTop === 0 && hasMoreMessages) {
      loadMoreMessages();
    }

    // Ativa o scroll automático apenas se o usuário estiver no final da lista
    const container = messagesContainerRef.current;
    if (container) {
      const isAtBottom =
        container.scrollHeight - container.scrollTop === container.clientHeight;
      shouldScrollToBottom.current = isAtBottom;
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    socket.emit("sendMessage", {
      conversationId,
      profileId: currentUser,
      content: newMessage,
    });
    setNewMessage("");
  };

  const scrollToBottom = () => {
    if (shouldScrollToBottom.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Função para verificar se as mensagens estão em ordem decrescente
  const isDescendingOrder = (messages: Message[]): boolean => {
    if (messages.length < 2) return true;
    const firstDate = new Date(messages[0].createdAt).getTime();
    const secondDate = new Date(messages[1].createdAt).getTime();
    return firstDate > secondDate;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-2xl h-full flex flex-col">
        <div className="p-4 border-b flex justify-between items-center mb-1">
          <h2 className="text-xl font-semibold">Diálogo</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div
          className="flex-1 overflow-y-auto p-4 space-y-4"
          onScroll={handleScroll}
          ref={messagesContainerRef}
          style={{ overflowAnchor: "auto" }}
        >
          {loading && offset === 0 && (
            <p className="text-center text-gray-500">Carregando mensagens...</p>
          )}
          {messages.map((message) => {
            const isCurrentUser = message.profileId === currentUser;
            return (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                {!isCurrentUser && (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center">
                    {message.profile.avatarUrl ? (
                      <img
                        src={message.profile.avatarUrl}
                        alt={message.profile.username}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-600">
                        {message.profile.username[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-lg p-3 ${
                    isCurrentUser
                      ? "bg-indigo-600 text-white self-end"
                      : "bg-gray-200 text-gray-900 self-start"
                  }`}
                >
                  <p className="text-sm mb-1">{message.content}</p>
                  <p className="text-xs opacity-75">
                    {formatDistanceToNow(new Date(message.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite uma mensagem..."
            className="flex-1 p-2 border rounded-lg mr-2"
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
