import { jwtDecode } from "jwt-decode";
import {
  Earth,
  LogIn,
  LogOut,
  MessageSquare,
  PlusSquare,
  Send,
  Shield,
  ShoppingBag,
  ShoppingCart,
  StickyNote,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LogoZanzar from "../assets/logo-zanzar-indigo-clean-40.png";
import { useGlobalContext } from "../context/globalContext";
import { InvitesIndicator } from "../indicators/InvitesIndicator";
import { MessageIndicator } from "../indicators/MessageIndicator";
import { NotificationIndicator } from "../indicators/NotificationIndicator";
import { logOut } from "../utils/logout";
import AdModal from "./AdModal";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { token, autentication, userName, totalUnread } = useGlobalContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasAuthenticated, setHasAuthenticated] = useState(false);
  const [unreadChatsCount, setUnreadChatsCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadInvites, setUnreadInvites] = useState(0);

  useEffect(() => {
    const authenticate = async () => {
      await autentication();
      setHasAuthenticated(true);
    };

    if (!hasAuthenticated) {
      authenticate();
    }
  }, [hasAuthenticated]);

  useEffect(() => {
    if (token) {
      const decoded: any = jwtDecode(token);
      const isAdmin = decoded.role === "admin";
      setIsAdmin(isAdmin);
    }
  }, [token]);

  const handleOpenMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await logOut(navigate);
  };

  const menuItems = [
    {
      icon: <Earth className="w-8 h-8" />,
      label: "Mundo",
      path: "/",
      onClick: () => navigate("/"),
    },
    ...(token
      ? [
          {
            icon: <User className="w-8 h-8" />,
            label: "Perfil",
            path: `/profile/${userName}`,
            onClick: () => userName && navigate(`/profile/${userName}`),
          },
          {
            icon: <ShoppingBag className="w-8 h-8" />,
            label: "Minhas compras",
            path: "/my-purchases",
            onClick: () => navigate("/my-purchases"),
          },
          {
            icon: <MessageSquare className="w-8 h-8" />,
            label: "Conversas",
            path: "/messages",
            onClick: () => {
              navigate("/messages");
            },
          },
          {
            icon: <StickyNote className="w-8 h-8" />,
            label: "Notificações",
            path: "/notifications",
            onClick: () => {
              userName && navigate(`/notifications`);
            },
          },
          {
            icon: <Send className="w-8 h-8" />,
            label: "Convites",
            path: "/invites",
            onClick: () => {
              navigate("/invites");
            },
          },
          {
            icon: <PlusSquare className="w-8 h-8" />,
            label: "Publicar",
            path: "/create",
            onClick: () => navigate("/create"),
          },
          ...(isAdmin
            ? [
                {
                  icon: <Shield className="w-8 h-8" />,
                  label: "Admin",
                  path: "/admin",
                  onClick: () => navigate("/admin"),
                },
              ]
            : []),
          {
            icon: <LogOut className="w-8 h-8" />,
            label: "Sair",
            className: "text-red-600",
            onClick: handleLogout,
          },
        ]
      : [
          {
            icon: <LogIn className="w-8 h-8" />,
            label: "Login",
            onClick: () => navigate("/login"),
          },
        ]),
  ];

  return (
    <div className="h-full bg-gray-100">
      <nav className="h-full bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <img src={LogoZanzar} alt="Zanzar Logo" className="w-10 h-10" />
                <span className="ml-2 font-semibold text-lg">Zanzar</span>
              </div>
              <div className="flex items-center space-x-3">
                <PlusSquare
                  className="w-8 h-8 text-gray-600"
                  onClick={() => navigate("/create")}
                />
                <div className="relative">
                  <MessageSquare
                    className="w-8 h-8 text-gray-600"
                    onClick={() => navigate("/messages")}
                  />
                  <div className="absolute bottom-5 left-[-8px] rotate-90">
                    <MessageIndicator
                      isMenuOpen={isMenuOpen}
                      unreadChatsCount={unreadChatsCount}
                      setUnreadChatsCount={setUnreadChatsCount}
                    />
                  </div>
                </div>
                <ShoppingCart
                  className="w-8 h-8 text-gray-600"
                  onClick={() => navigate("/my-cart")}
                />
              </div>
            </div>
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick}
                  className={`relative flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-gray-100 ${
                    item.path === location.pathname
                      ? "text-indigo-600"
                      : "text-gray-700"
                  } ${item.className || ""}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.label === "Notifications" && <NotificationIndicator />}
                  {item.label === "Messages" && <MessageIndicator />}
                  {item.label === "Invites" && <InvitesIndicator />}
                </button>
              ))}
            </div>
            {/* Mobile Menu Button */}
            <button
              onClick={() => handleOpenMenu()}
              className="md:hidden p-2 rounded-md hover:bg-gray-100 fixed"
              style={{
                position: "absolute",
                bottom: "0",
                left: "0",
                width: "50px",
                height: "50px",
                clipPath: "polygon(0% 0%, 100% 0%, 0% 100%)",
                backgroundColor: "#4f46e5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                transition: "transform 0.3s ease-in-out",
                transform: isMenuOpen ? "rotate(90deg)" : "rotate(270deg)",
              }}
            >
              {totalUnread > 0 && (
                <div className="absolute bottom-7 left-2 bg-red-500 text-white rounded-full w-3 h-3 flex items-center justify-center text-xs rotate-270">
                  {isMenuOpen
                    ? (unreadInvites ?? 0) +
                      (unreadChatsCount ?? 0) +
                      (unreadNotifications ?? 0)
                    : ""}
                </div>
              )}
            </button>
          </div>
          {/* Mobile Menu */}
          <div
            className={`md:hidden transition-all duration-300 ease-in-out ${
              isMenuOpen
                ? "opacity-100 visible scale-100"
                : "opacity-0 invisible scale-0"
            }`}
            style={{
              position: "absolute",
              bottom: "60px",
              left: "0",
              width: "100%",
              maxHeight: "calc(100vh - 60px)",
              backgroundColor: "white",
              borderTopLeftRadius: "16px",
              borderTopRightRadius: "16px",
              boxShadow: "0px -4px 6px rgba(0, 0, 0, 0.1)",
              overflowY: "auto",
              zIndex: 1000,
            }}
          >
            <div
              className="grid grid-cols-3 gap-4 p-4"
              style={{
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              }}
            >
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.onClick();
                    setIsMenuOpen(false);
                  }}
                  className="relative flex flex-col items-center space-y-2 p-2 rounded-md hover:bg-gray-100 text-gray-700"
                >
                  {React.cloneElement(item.icon, {
                    className: "w-8 h-8",
                  })}
                  <div
                    className="absolute bottom-10 left-11"
                    style={{
                      transition: "transform 0.3s ease-in-out",
                      transform: "rotate(90deg)",
                    }}
                  >
                    {item.label === "Notificações" && (
                      <NotificationIndicator
                        isMenuOpen={isMenuOpen}
                        unreadNotifications={unreadNotifications}
                        setUnreadNotifications={setUnreadNotifications}
                      />
                    )}
                    {item.label === "Conversas" && (
                      <MessageIndicator
                        isMenuOpen={isMenuOpen}
                        unreadChatsCount={unreadChatsCount}
                        setUnreadChatsCount={setUnreadChatsCount}
                      />
                    )}
                    {item.label === "Convites" && (
                      <InvitesIndicator
                        isMenuOpen={isMenuOpen}
                        unreadInvites={unreadInvites}
                        setUnreadInvites={setUnreadInvites}
                      />
                    )}
                  </div>
                  <span className="text-xs">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <AdModal />
        {children}
      </main>
    </div>
  );
}
