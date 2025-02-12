import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LogOut,
  Home,
  PlusSquare,
  User,
  MessageSquare,
  ShoppingBag,
  Shield,
  LogIn,
  StickyNote,
} from "lucide-react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import AdModal from "./AdModal";
import { NotificationIndicator } from "./NotificationIndicator";

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const token = Cookies.get("access_token");
  const userName = Cookies.get("user_name");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (token) {
      const decoded: any = jwtDecode(token);
      const isAdmin = decoded.role === "admin";
      setIsAdmin(isAdmin);
    }
  }, []);

  const handleLogout = async () => {
    navigate("/login");
    Cookies.remove("access_token");
    Cookies.remove("profile_id");
    Cookies.remove("user_name");
    Cookies.remove("unread_notifications");
  };

  const menuItems = [
    {
      icon: <Home className="w-8 h-8" />,
      label: "Home",
      path: "/",
      onClick: () => navigate("/"),
    },
    ...(token
      ? [
        {
          icon: <StickyNote className="w-8 h-8" />,
          label: "Notifications",
          path: "/notifications",
          onClick: () => userName && navigate(`/notifications`),
        },
        {
          icon: <User className="w-8 h-8" />,
          label: "Profile",
          path: `/profile/${userName}`,
          onClick: () => userName && navigate(`/profile/${userName}`),
        },
        {
          icon: <PlusSquare className="w-8 h-8" />,
          label: "Create Post",
          path: "/create",
          onClick: () => navigate("/create"),
        },
        {
          icon: <MessageSquare className="w-8 h-8" />,
          label: "Messages",
          path: "/messages",
          onClick: () => navigate("/messages"),
        },
        {
          icon: <ShoppingBag className="w-8 h-8" />,
          label: "Store",
          path: "/store",
          onClick: () => navigate("/store"),
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
          label: "Logout",
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
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Home className="w-6 h-6 text-indigo-600" />
              <span className="ml-2 font-semibold text-lg">Zanzar</span>
            </div>
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick}
                  className={`relative flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-gray-100 ${item.path === location.pathname
                    ? "text-indigo-600"
                    : "text-gray-700"
                    } ${item.className || ""}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
              style={{
                position: "fixed",
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
              <div>
                <NotificationIndicator isMenuOpen={isMenuOpen} />
              </div>
            </button>
          </div>
          {/* Mobile Menu */}
          <div
            className={`md:hidden transition-all duration-300 ease-in-out ${isMenuOpen
              ? "opacity-100 visible scale-100"
              : "opacity-0 invisible scale-0"
              }`}
            style={{
              position: "fixed",
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
                  <div className="absolute bottom-10 left-11" style={{
                    transition: "transform 0.3s ease-in-out",
                    transform: "rotate(90deg)"
                  }}>
                    {item.label === "Notifications" ? <NotificationIndicator isMenuOpen={isMenuOpen} /> : null}
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