import Cookies from "js-cookie";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import LogoZanzar from "../assets/logo-zanzar-indigo-96.png";
import { loginUserReq } from "../requests/authRequests";
import { loginSchema } from "../validations/loginSchema";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);

    try {
      await loginSchema.validate({ email, password }, { abortEarly: false });

      const data = await loginUserReq(email, password);

      // Explicitly set cookies
      Cookies.set("access_token", data.token, { path: "/" });
      Cookies.set("profile_id", data.profileId, { path: "/" });
      Cookies.set("user_name", data.userName, { path: "/" });
      Cookies.set("unread_notifications", data.unreadNotificationsCount, {
        path: "/",
      });
      Cookies.set("unread_chat_messages", data.unreadChatMessages, { path: "/" });
      Cookies.set("invites", data.invites, { path: "/" });

      // Show success toast
      toast.success("Autenticado com sucesso!");

      // Use window.location for direct navigation
      window.location.href = "/";
    } catch (error: any) {
      console.error("Login error:", error);

      if (error.name === "ValidationError") {
        setErrors(error.inner.map((err: any) => err.message));
      } else {
        setErrors([error.message]);
      }

      toast.error("Erro ao tentar logar!");
    } finally {
      setLoading(false);
    }
  };
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-white flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="flex items-center justify-center mb-2">
          <img src={LogoZanzar} alt="Zanzar" className="w-24 h-24" />
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Login
        </h2>
        {errors.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <ul className="list-disc pl-5">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              placeholder="seu@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              "Entrar"
            )}
          </button>
        </form>
        <p className="mt-8 text-center text-gray-600">
          Não tem uma conta?{" "}
          <Link
            to="/register"
            className="text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
