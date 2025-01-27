import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LogOut,
  Home,
  PlusSquare,
  Menu,
  X,
  User,
  MessageSquare,
  ShoppingBag,
  Shield,
  LogIn,
} from "lucide-react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import AdModal from "./AdModal";

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
    Cookies.remove("user_id");
    Cookies.remove("user_name");
  };

  const menuItems = [
    {
      icon: <Home className="w-5 h-5" />,
      label: "Home",
      path: "/",
      onClick: () => navigate("/"),
    },
    ...(token
      ? [
          {
            icon: <PlusSquare className="w-5 h-5" />,
            label: "Create Post",
            path: "/create",
            onClick: () => navigate("/create"),
          },
          {
            icon: <MessageSquare className="w-5 h-5" />,
            label: "Messages",
            path: "/messages",
            onClick: () => navigate("/messages"),
          },
          {
            icon: <ShoppingBag className="w-5 h-5" />,
            label: "Store",
            path: "/store",
            onClick: () => navigate("/store"),
          },
          {
            icon: <User className="w-5 h-5" />,
            label: "Profile",
            path: `/profile/${userName}`,
            onClick: () => userName && navigate(`/profile/${userName}`),
          },
          ...(isAdmin
            ? [
                {
                  icon: <Shield className="w-5 h-5" />,
                  label: "Admin",
                  path: "/admin",
                  onClick: () => navigate("/admin"),
                },
              ]
            : []),
          {
            icon: <LogOut className="w-5 h-5" />,
            label: "Logout",
            className: "text-red-600",
            onClick: handleLogout,
          },
        ]
      : [
          {
            icon: <LogIn className="w-5 h-5" />,
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
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-gray-100 ${
                    item.path === location.pathname
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
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          <div
            className={`md:hidden transition-all duration-300 ease-in-out ${
              isMenuOpen
                ? "max-h-screen opacity-100 visible"
                : "max-h-0 opacity-0 invisible"
            }`}
          >
            <div className="py-2 space-y-1">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.onClick();
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-2 px-4 py-3 rounded-md hover:bg-gray-100 ${
                    item.path === location.pathname
                      ? "text-indigo-600"
                      : "text-gray-700"
                  } ${item.className || ""}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
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
