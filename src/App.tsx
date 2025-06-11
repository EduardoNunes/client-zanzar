import { App as CapacitorApp } from "@capacitor/app";
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

  useEffect(() => {
    if (socket && token) {
      setSocketConnect(socket);
    }
  }, [socket, setSocketConnect]);

  useEffect(() => {
    const loadToken = async () => {
      await autentication();
      setIsTokenLoaded(true);
    };
    loadToken();
  }, []);

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
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <AppRoutes />
    </>
  );
}

export default AppWrapper;
