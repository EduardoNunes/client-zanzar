import Cookies from "js-cookie";
import { CircleUserRound, MessagesSquare, Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatModal from "../components/ChatModal";
import {
  createChatReq,
  getFollowedUsersReq,
  getUserChatsReq,
} from "../requests/chatRequests";
import { MessageIndicator } from "../components/MessageIndicator";

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
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [followedUsers, setFollowedUsers] = useState<FollowedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [userChats, setUserChats] = useState<UserChats[]>([]);
  const [usersTemp, setUsersTemp] = useState<FollowedUser[]>([]);

  useEffect(() => {
    const profileId = Cookies.get("profile_id");

    if (!profileId) {
      navigate("/login");
      return;
    }

    setCurrentUser(profileId);
    fetchFollowedUsers(profileId);
    fetchUserChats(profileId);
  }, []);

  const fetchFollowedUsers = async (profileId: string) => {
    const data = await getFollowedUsersReq(profileId);

    const users = data.map((item: FollowedUser) => ({
      id: item.id,
      username: item.username,
      avatarUrl: item.avatarUrl,
    }));

    setUsersTemp(users);
    setFollowedUsers(users);
  };

  const fetchUserChats = async (profileId: string) => {
    const data = await getUserChatsReq(profileId);
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
        selectedProfileId
      );

      fetchUserChats(profileId);
      setSearchQuery("");
      setSelectedChatId(newChat.conversationId);
    } catch (error) {
      console.error("Error starting chat:", error);
    } finally {
      setLoading(false);
    }
  };

  const openChat = async (chatId: string) => {
    setSelectedChatId(chatId);

    userChats.map((chat) => {
      if (chat.conversationId === chatId) {
        chat.messagesCount = 0;
      }
    })
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
              <span className="text-sm font-medium">Chats</span>
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
                    {userChat.messagesCount > 0 ?
                      <div className="absolute top-[-8px] left-[-24px] z-50" style={{ transform: "rotate(90deg)" }}>
                        <MessageIndicator messagesCount={userChat.messagesCount} />
                      </div>
                      : ''}
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
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.username}
                        className={` object-cover ${!user.avatarUrl ? "h-6 w-6" : "w-full h-full"
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
