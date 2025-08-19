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

  // Configura StatusBar para respeitar safe-area
  useEffect(() => {
    const setupStatusBar = async () => {
      try {
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setStyle({ style: Style.Default });
      } catch (e) {
        console.log("StatusBar setup failed:", e);
      }
    };
    setupStatusBar();
  }, []);

  // Configura conexão do socket
  useEffect(() => {
    if (socket && token) {
      setSocketConnect(socket);
    }
  }, [socket, setSocketConnect]);

  // Carrega token
  useEffect(() => {
    const loadToken = async () => {
      await autentication();
      setIsTokenLoaded(true);
    };
    loadToken();
  }, []);

  // Listener botão voltar no Android
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

  if (!isTokenLoaded) return null;

  return (
    <div
      className="relative bg-white"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
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
