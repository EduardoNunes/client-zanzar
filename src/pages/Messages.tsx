import { Preferences } from "@capacitor/preferences";
import { CircleUserRound, MessagesSquare, Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ChatModal from "../components/ChatModal";
import { useGlobalContext } from "../context/globalContext";
import {
  createChatReq,
  getFollowedUsersReq,
  getUserChatsReq,
} from "../requests/chatRequests";

interface FollowedUser {
  avatarUrl: any;
  id: string;
  username: string;
  following: Following;
}

interface Following {
  id: string;
  username: string;
  avatarUrl: string | null;
}

interface UserChats {
  conversationId: string;
  name: string | null;
  isGroup: boolean;
  createdAt: Date;
  messagesCount: number;
  participants: {
    profileId: string;
    username: string;
    avatarUrl: string | null;
  }[];
}

export default function Messages() {
  const { profileId, token, isLoadingToken } = useGlobalContext();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [followedUsers, setFollowedUsers] = useState<FollowedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [userChats, setUserChats] = useState<UserChats[]>([]);
  const [usersTemp, setUsersTemp] = useState<FollowedUser[]>([]);

  useEffect(() => {
    if (!isLoadingToken && !profileId) {
      navigate("/login");
      return;
    }
  }, [isLoadingToken, profileId, navigate]);

  useEffect(() => {
    if (profileId && token) {
      setCurrentUser(profileId);
      fetchFollowedUsers(profileId);
      fetchUserChats(profileId);
    }
  }, [profileId, token]);

  const fetchFollowedUsers = async (profileId: string) => {
    if (!token) {
      console.error("Token não encontrado.");
      return;
    }

    const data = await getFollowedUsersReq(profileId, token);

    const users = data.map((item: FollowedUser) => ({
      id: item.id,
      username: item.username,
      avatarUrl: item.avatarUrl,
    }));

    setUsersTemp(users);
    setFollowedUsers(users);
  };

  const fetchUserChats = async (profileId: string) => {
    if (!token) {
      console.error("Token not found");
      return;
    }

    const data = await getUserChatsReq(profileId, token);
    const chats = data.map((item: UserChats) => ({
      conversationId: item.conversationId,
      chatName: item.name,
      participants: item.participants,
      messagesCount: item.messagesCount,
    }));
    setUserChats(chats);
  };

  const handleSearchIfollow = (userName: string) => {
    setSearchQuery(userName);

    if (userName.length === 0) {
      setFollowedUsers(usersTemp);

      return;
    }

    const filteredUsers = followedUsers.filter((user) =>
      user.username.toLowerCase().includes(userName.toLowerCase())
    );

    setFollowedUsers(filteredUsers);
  };

  const startChat = async (selectedProfileId: string) => {
    if (!profileId || !token) {
      navigate("/");
      throw new Error("Usuário não encontrado.");
    }

    // Confere se o chat já existe
    const conversation = userChats.find(
      (userChat) =>
        userChat.participants.some(
          (participant) => participant.profileId === profileId
        ) &&
        userChat.participants.some(
          (participant) => participant.profileId === selectedProfileId
        )
    );

    if (conversation) {
      setSearchQuery("");

      setSelectedChatId(conversation.conversationId);
      return;
    }

    try {
      setLoading(true);

      // Cria novo chat
      const nameChat = "";

      const newChat = await createChatReq(
        nameChat,
        profileId,
        selectedProfileId,
        token
      );

      fetchUserChats(profileId);
      setSearchQuery("");
      setSelectedChatId(newChat.conversationId);
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error("Erro ao iniciar o chat.");
    } finally {
      setLoading(false);
    }
  };

  const openChat = async (chatId: string) => {
    setSelectedChatId(chatId);

    // atualiza o contador de mensagens não lidas
    const updatedChats = userChats.map((chat) => {
      if (chat.conversationId === chatId) {
        return { ...chat, messagesCount: 0 };
      }
      return chat;
    });

    setUserChats(updatedChats);

    // Recalcula o total de mensagens não lidas
    const remainingUnreadMessages = updatedChats.reduce(
      (total, chat) => total + chat.messagesCount,
      0
    );

    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    if (isMobile) {
      await Preferences.set({
        key: "unread_chat_messages",
        value: remainingUnreadMessages.toString(),
      });
    } else {
      localStorage.setItem(
        "unread_chat_messages",
        remainingUnreadMessages.toString()
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>

        {/* Search */}
        <div className="relative mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchIfollow(e.target.value)}
            placeholder="Search users..."
            className="w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
        </div>

        {/* Chats List */}
        {userChats?.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 text-gray-600 mb-4">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Diálogos</span>
            </div>
            <div className="space-y-2">
              {userChats?.map((userChat: UserChats) => {
                const participantNames =
                  userChat.participants && userChat.participants.length > 0
                    ? userChat.participants
                        .map(
                          (participant) =>
                            participant.username || "Desconhecido"
                        )
                        .join(", ")
                    : "Sem participantes";

                return (
                  <button
                    key={userChat.conversationId}
                    onClick={() => openChat(userChat.conversationId)}
                    disabled={loading}
                    className="relative w-full px-3 py-1 text-left hover:bg-gray-50 rounded-lg flex items-center space-x-3 transition-colors disabled:opacity-50"
                  >
                    {userChat.messagesCount > 0 ? (
                      <div className="absolute bottom-7 left-2 bg-red-500 text-white rounded-full w-3 h-3 flex justify-center pb-[2px] items-center text-center text-xs z-3">
                        {userChat.messagesCount}
                      </div>
                    ) : null}
                    {/* Avatares dos participantes */}
                    <div className="flex -space-x-2">
                      {userChat.participants?.map((participant, index) => (
                        <div
                          key={participant.profileId}
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-white"
                          style={{
                            zIndex: userChat.participants.length - index,
                          }}
                        >
                          {participant.avatarUrl ? (
                            <img
                              src={participant.avatarUrl}
                              alt={participant.username || "Usuário"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <MessagesSquare />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Nome do chat */}
                    <span className="text-gray-700">{participantNames}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Following List */}
        {followedUsers.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 text-gray-600 mb-4">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Contatos</span>
            </div>
            <div className="space-y-2">
              {followedUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => startChat(user.id)}
                  disabled={loading}
                  className="w-full px-3 py-1 text-left hover:bg-gray-50 rounded-lg flex items-center space-x-3 transition-colors disabled:opacity-50"
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.username}
                        className={` object-cover ${
                          !user.avatarUrl ? "h-6 w-6" : "w-full h-full"
                        }`}
                      />
                    ) : (
                      <CircleUserRound />
                    )}
                  </div>
                  <span className="text-gray-700">{user.username}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedChatId && (
        <ChatModal
          conversationId={selectedChatId}
          onClose={() => setSelectedChatId(null)}
          currentUser={currentUser || ""}
        />
      )}
    </div>
  );
}
