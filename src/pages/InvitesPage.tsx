import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getInvitesReq, sendInvitesReq } from "../requests/invitesRequests";
import { useGlobalContext } from "../context/globalContext";
import { useNavigate } from "react-router-dom";

interface Invite {
  id: string;
  email: string;
  status: "pending" | "accepted";
  sentAt: string;
}

export default function InvitesPage() {
  const { invites, setInvites, token, isLoadingToken, profileId } =
    useGlobalContext();
  const navigate = useNavigate();
  const [invitesSended, setInvitesSended] = useState<Invite[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
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
    setLoading(true);

    getInvitesReq(token)
      .then((res) => {
        setInvitesAvaliable(res.invitesAvaliable);
        setInvitesSended(res.invites);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const sendInvite = async () => {
    if (!token) {
      console.error("Token not found");
      return;
    }
    setLoading(true);

    if (!email) {
      toast.info("Convide alguém querido");
      setLoading(false);
      return;
    }

    try {
      await sendInvitesReq(email.toLowerCase(), token);
      await fetchInvites();
      setInvites(invites ? invites - 1 : 0);
      setEmail("");
      toast.success("Invite sent successfully!");
    } catch (error) {
      console.error("Error sending invite:", error);
      toast.error("Error sending invite.");
    } finally {
      setLoading(false);
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
        <input
          type="email"
          placeholder="Digite o e-mail do convidado"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 p-2 border rounded-md"
          disabled={false}
        />
        <button
          onClick={sendInvite}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
          disabled={loading || false}
        >
          {loading ? "Enviando..." : "Enviar"}
        </button>
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
