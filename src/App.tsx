import { App as CapacitorApp } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";
import { useEffect, useState } from "react";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GlobalProvider, useGlobalContext } from "./context/globalContext";
import AppRoutes from "./routes/AppRoutes";
import { useSocket } from "./hooks/useSocket";

function AppWrapper() {
  return (
    <GlobalProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GlobalProvider>
  );
}

function App() {
  const { autentication, setSocketConnect, token } = useGlobalContext();
  const [isTokenLoaded, setIsTokenLoaded] = useState(false);
  const navigate = useNavigate();
  const socket = useSocket();

  // Conexão do socket
  useEffect(() => {
    if (socket && token) {
      setSocketConnect(socket);
    }
  }, [socket, setSocketConnect, token]);

  // Autenticação inicial
  useEffect(() => {
    const loadToken = async () => {
      await autentication();
      setIsTokenLoaded(true);
    };
    loadToken();
  }, []);

  // Listener para botão de voltar (Android)
  useEffect(() => {
    let backButtonListener: any;

    const setupBackButtonListener = async () => {
      if (CapacitorApp) {
        backButtonListener = await CapacitorApp.addListener(
          "backButton",
          () => {
            if (window.history.state && window.history.state.idx > 0) {
              navigate(-1);
            } else {
              console.log("No more history to go back to.");
            }
          }
        );
      }
    };

    setupBackButtonListener();

    return () => {
      if (backButtonListener) backButtonListener.remove();
    };
  }, [navigate]);

  // Configuração da StatusBar
  useEffect(() => {
    const setupStatusBar = async () => {
      try {
        await StatusBar.setOverlaysWebView({ overlay: false }); // impede que o conteúdo vá por baixo da status bar
        await StatusBar.setBackgroundColor({ color: "#000000" }); // fundo preto
        await StatusBar.setStyle({ style: Style.Light }); // ícones brancos
      } catch (err) {
        console.warn("Erro ao configurar StatusBar:", err);
      }
    };
    setupStatusBar();
  }, []);

  if (!isTokenLoaded) return null;

  return (
    <div
      className="relative min-h-screen bg-white"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="bg-gray-100 min-h-screen">
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        <AppRoutes />
      </div>
    </div>
  );
}

export default AppWrapper;
