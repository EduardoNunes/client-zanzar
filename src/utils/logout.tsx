import { Preferences } from "@capacitor/preferences";
import Cookies from "js-cookie";

export const logOut = async () => {
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);

  if (isMobile) {
    await Preferences.remove({ key: "access_token" });
    await Preferences.remove({ key: "refresh_token" });
    await Preferences.remove({ key: "profile_id" });
    await Preferences.remove({ key: "user_name" });
    await Preferences.remove({ key: "unread_notifications" });
    await Preferences.remove({ key: "unread_chat_messages" });
    await Preferences.remove({ key: "invites" });
  } else {
    Cookies.remove("access_token", { path: "/" });
    Cookies.remove("refresh_token", { path: "/" });
    Cookies.remove("profile_id", { path: "/" });
    Cookies.remove("user_name", { path: "/" });
    Cookies.remove("unread_notifications", { path: "/" });
    Cookies.remove("unread_chat_messages", { path: "/" });
    Cookies.remove("invites", { path: "/" });
  }
  
  window.location.href = "/login";
};
