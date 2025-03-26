import { Preferences } from "@capacitor/preferences";
import Cookies from "js-cookie";
import React, { ReactNode, createContext, useContext } from "react";

interface GlobalContextType {
  autentication: () => Promise<void>;
  token: string | null;
  setToken: (token: string) => void;
  profileId: string | null;
  setProfileId: (profileId: string) => void;
  userName: string | null;
  setUserName: (userName: string) => void;
  unreadNotifications: number | null;
  setUnreadNotifications: (unreadNotifications: number | null) => void;
  unreadChatMessages: number | null;
  setUnreadChatMessages: (unreadChatMessages: number | null) => void;
  invites: number | null;
  setInvites: (invites: number) => void;
  isLoadingToken: boolean;
  totalUnread: number;
}

const GlobalContext = createContext<GlobalContextType | null>(null);

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const [token, setToken] = React.useState<string | null>(null);
  const [profileId, setProfileId] = React.useState<string | null>(null);
  const [userName, setUserName] = React.useState<string | null>(null);
  const [unreadNotifications, setUnreadNotifications] = React.useState<
    number | null
  >(null);
  const [unreadChatMessages, setUnreadChatMessages] = React.useState<
    number | null
  >(null);
  const [invites, setInvites] = React.useState<number | null>(null);
  const [isLoadingToken, setIsLoadingToken] = React.useState<boolean>(true);
  const totalUnread =
    (unreadNotifications || 0) + (unreadChatMessages || 0) + (invites || 0);

  const autentication = async () => {
    setIsLoadingToken(true);

    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    let hasToken = null;
    let profileId = null;
    let userName = null;
    let unreadNotifications = null;
    let unreadChatMessages = null;
    let invites = null;

    if (isMobile) {
      const tokenResult = await Preferences.get({ key: "access_token" });
      hasToken = tokenResult.value;
      const profileIdResult = await Preferences.get({ key: "profile_id" });
      profileId = profileIdResult.value;
      const userNameResult = await Preferences.get({ key: "user_name" });
      userName = userNameResult.value;
      const unreadNotificationsResult = await Preferences.get({
        key: "unread_notifications",
      });
      unreadNotifications = unreadNotificationsResult.value
        ? JSON.parse(unreadNotificationsResult.value)
        : null;
      const unreadChatMessagesResult = await Preferences.get({
        key: "unread_chat_messages",
      });
      unreadChatMessages = unreadChatMessagesResult.value
        ? JSON.parse(unreadChatMessagesResult.value)
        : null;
      const invitesResult = await Preferences.get({ key: "invites" });
      invites = invitesResult.value ? JSON.parse(invitesResult.value) : null;
    } else {
      hasToken = Cookies.get("access_token");
      profileId = Cookies.get("profile_id");
      userName = Cookies.get("user_name");
      unreadNotifications = Cookies.get("unread_notifications")
        ? JSON.parse(Cookies.get("unread_notifications") || "null")
        : null;
      unreadChatMessages = Cookies.get("unread_chat_messages")
        ? JSON.parse(Cookies.get("unread_chat_messages") || "null")
        : null;
      invites = Cookies.get("invites")
        ? JSON.parse(Cookies.get("invites") || "null")
        : null;
    }

    hasToken && setToken(hasToken);
    profileId && setProfileId(profileId);
    userName && setUserName(userName);
    unreadNotifications !== null && setUnreadNotifications(unreadNotifications);
    unreadChatMessages !== null && setUnreadChatMessages(unreadChatMessages);
    invites !== null && setInvites(invites);

    setIsLoadingToken(false);
  };

  const contextValue: GlobalContextType = {
    autentication,
    token,
    setToken,
    profileId,
    setProfileId,
    userName,
    setUserName,
    unreadNotifications,
    setUnreadNotifications,
    unreadChatMessages,
    setUnreadChatMessages,
    invites,
    setInvites,
    isLoadingToken,
    totalUnread,
  };

  return (
    <GlobalContext.Provider value={contextValue}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
};
