import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getInvitesReq, sendInvitesReq } from "../requests/invitesRequests";
import { useGlobalContext } from "../context/globalContext";
import { useNavigate } from "react-router-dom";
import { Preferences } from "@capacitor/preferences";

interface Invite {
  id: string;
  email: string;
  status: "pending" | "accepted";
  sentAt: string;
}

export default function InvitesPage() {
  const { token, isLoadingToken, profileId } = useGlobalContext();
  const navigate = useNavigate();
  const [invitesSended, setInvitesSended] = useState<Invite[]>([]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [invitesAvaliable, setInvitesAvaliable] = useState(0);

  useEffect(() => {
    if (!isLoadingToken && !profileId) {
      navigate("/login");
    }
  }, [isLoadingToken, profileId, navigate]);

  useEffect(() => {
    if (token) {
      fetchInvites();
    }
  }, [token]);

  const fetchInvites = async () => {
    if (!token) {
      console.error("Token not found");
      return;
    }
    setIsLoading(true);

    getInvitesReq(token)
      .then((res) => {
        setInvitesAvaliable(res.invitesAvaliable);
        setInvitesSended(res.invites);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      console.error("Token not found");
      return;
    }

    if (!email.trim()) {
      setError("Por favor, insira um email");
      return;
    }

    if (!validateEmail(email)) {
      setError("Por favor, insira um email válido");
      return;
    }

    try {
      setIsLoading(true);
      await sendInvitesReq(email, token);
      await fetchInvites();

      const isMobile = /Mobi|Android/i.test(navigator.userAgent);

      if (isMobile) {
        await Preferences.set({
          key: "invites",
          value: (invitesAvaliable ? invitesAvaliable - 1 : 0).toString(),
        });
      } else {
        localStorage.setItem(
          "invites",
          (invitesAvaliable ? invitesAvaliable - 1 : 0).toString()
        );
      }

      setEmail("");
      toast.success("Convite enviado com sucesso!");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Erro ao enviar convite";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Gerenciar Convites</h1>

      <p className="mb-4 text-gray-600">
        Você possui <strong>{invitesAvaliable}</strong>
        {invitesAvaliable <= 1 ? " convite" : " convites"}.
      </p>

      <div className="flex flex-col gap-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email do Convidado
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value.toLowerCase());
                setError(null);
              }}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                error ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="exemplo@email.com"
              disabled={isLoading}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Enviando..." : "Enviar Convite"}
          </button>
        </form>
      </div>

      <h2 className="text-lg font-semibold mb-3">Convites Enviados</h2>
      <ul className="space-y-2">
        {invitesSended.length === 0 ? (
          <p className="text-gray-500">Nenhum convite enviado ainda.</p>
        ) : (
          invitesSended.map((invite) => (
            <li
              key={invite.id}
              className="p-3 border rounded-md flex justify-between items-center"
            >
              <span className="text-gray-700">{invite.email}</span>
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-md ${
                  invite.status === "accepted"
                    ? "bg-green-200 text-green-800"
                    : "bg-yellow-200 text-yellow-800"
                }`}
              >
                {invite.status === "accepted" ? "Aceito" : "Pendente"}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
