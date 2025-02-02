import { MessageSquare, Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import ChatModal from "../components/ChatModal";
import { set } from "date-fns";
import Cookies from "js-cookie";
import {
  getFollowedUsersReq,
  getUsersSearchReq,
  getUserChatsReq,
  createChatReq,
} from "../requests/chatRequests";
import userImageDefault from "../assets/user.svg";
import { useNavigate } from "react-router-dom";
import ImageChats from "../assets/chats.svg";

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
  participants: {
    profileId: string;
    username: string;
    avatarUrl: string | null;
  }[];
}

export default function Messages() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    { username: string; id: string }[]
  >([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [followedUsers, setFollowedUsers] = useState<FollowedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [userChats, setUserChats] = useState<UserChats[]>([]);

  useEffect(() => {
    const username = Cookies.get("username");
    const profileId = Cookies.get("profile_id");
    username && setCurrentUser(username);
    profileId && fetchFollowedUsers(profileId);
    profileId && fetchUserChats(profileId);
  }, []);

  const fetchFollowedUsers = async (profileId: string) => {
    const data = await getFollowedUsersReq(profileId);

    const users = data.map((item: FollowedUser) => ({
      id: item.id,
      username: item.username,
      avatarUrl: item.avatarUrl,
    }));

    setFollowedUsers(users);
  };

  const fetchUserChats = async (profileId: string) => {
    const data = await getUserChatsReq(profileId);
    console.log("DATA", data);
    const chats = data.map((item: UserChats) => ({
      conversationId: item.conversationId,
      chatName: item.name,
      participants: item.participants,
    }));

    console.log("CHATS", chats);
    setUserChats(chats);
  };

  const handleSearchIfollow = async (userName: string) => {
    setSearchQuery(userName);

    if (userName.length <= 2) {
      setSearchResults([]);
      return;
    }

    const data = await getUsersSearchReq(userName);
    setSearchResults(data);
  };

  /* const findExistingChat = async (userId: string) => {
    const { data: participations } = await getExistingChat(userId);

    const chatIds = participations.map(
      (participation: { chat_id: any }) => participation.chat_id
    );

    // Faz uma única consulta ao banco de dados
    const { data: otherParticipants } = await supabase
      .from("chat_participants")
      .select("chat_id")
      .in("chat_id", chatIds) // Verifica se o chat_id está na lista de chatIds
      .eq("user_id", userId); // Filtra pelo user_id

    // Se houver resultados, retorna o primeiro chat_id encontrado
    if (otherParticipants && otherParticipants.length > 0) {
      return otherParticipants[0].chat_id;
    }
  }; */

  const startChat = async (selectedProfileId: string) => {
    const profileId = Cookies.get("profile_id");

    if (!profileId) {
      navigate("/");
      throw new Error("User ID is undefined");
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
      console.log("CONVERSATION", conversation);
      openChat(conversation.conversationId);
      return;
    }

    try {
      setLoading(true);

      // Cria novo chat
      const nameChat = "";

      const newChat = await createChatReq(
        nameChat,
        profileId,
        selectedProfileId
      );

      fetchUserChats(profileId);

      openChat(newChat.conversationId);
    } catch (error) {
      console.error("Error starting chat:", error);
    } finally {
      setLoading(false);
    }
  };

  const openChat = async (chatId: string) => {
    console.log("CHAT", chatId);
  };
  console.log("USERCHATS", userChats);
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

          {searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg border">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => startChat(user.id)}
                  disabled={loading}
                  className="w-full p-3 text-left hover:bg-gray-50 flex items-center space-x-3 disabled:opacity-50"
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-gray-500" />
                  </div>
                  <span>{user.username}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chats List */}
        {userChats?.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 text-gray-600 mb-4">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Chats</span>
            </div>
            <div className="space-y-2">
              {userChats?.map((userChat: UserChats) => {
                const participantNames =
                  userChat.participants && userChat.participants.length > 0
                    ? userChat.participants
                        .map((participant: { username?: string }) =>
                          participant.username
                            ? participant.username
                            : "Desconhecido"
                        )
                        .join(", ")
                    : "Sem participantes";

                return (
                  <button
                    key={userChat.conversationId}
                    onClick={() => openChat(userChat.conversationId)}
                    disabled={loading}
                    className="w-full px-3 py-1 text-left hover:bg-gray-50 rounded-lg flex items-center space-x-3 transition-colors disabled:opacity-50"
                  >
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      <img
                        src={ImageChats}
                        alt={participantNames}
                        className="w-6 h-6 object-cover"
                      />
                    </div>
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
              <span className="text-sm font-medium">Following</span>
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
                    <img
                      src={user.avatarUrl || userImageDefault}
                      alt={user.username}
                      className={` object-cover ${
                        !user.avatarUrl ? "h-6 w-6" : "w-full h-full"
                      }`}
                    />
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
          chatId={selectedChatId}
          onClose={() => setSelectedChatId(null)}
          currentUser={currentUser || ""}
        />
      )}
    </div>
  );
}
