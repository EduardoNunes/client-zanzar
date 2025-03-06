import { useEffect, useState } from "react";
import {
  getAllInvitesReq,
  grantInviteReq,
  sendInvitesToAllUsersReq,
  revokeInviteReq,
} from "../../requests/invitesManagementRequests";
import { toast } from "react-toastify";

interface User {
  id: string;
  email: string;
  status: "pending" | "accepted";
  inviter: {
    username: string;
    email: string;
  };
}

export default function InvitesManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUserName] = useState("");
  const [inviteCount, setInviteCount] = useState(1);
  const [inviteCountForAll, setInviteCountForAll] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    getAllInvitesReq()
      .then((res) => {
        setUsers(res.data);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Conceder convites a um usuário específico
  const grantInvite = async () => {
    setLoading(true);
    grantInviteReq(username.toLowerCase(), inviteCount)
      .then((res) => {
        toast.success(res.message);
        setUserName("");
        setInviteCount(1);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Conceder convites para todos os usuários
  const grantToAll = async () => {
    setLoading(true);
    sendInvitesToAllUsersReq(inviteCountForAll)
      .then((res) => {
        toast.success(res.message);
        setInviteCountForAll(1);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const revokeInvite = async (id: string) => {
    setLoading(true);
    revokeInviteReq(id)
      .then((res) => {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
        toast.success(res.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "");

    setUserName(sanitizedValue);
  };

  return (
    <div className="admin-card p-4 bg-white shadow-md rounded-lg">
      <div className="card-header mb-4">
        <h2 className="text-xl font-bold">Gerenciamento de Convites</h2>
      </div>
      <div className="card-body">
        <h2 className="text-xl font-semibold mb-3 text-gray-800">
          Conceder Convites Individualmente
        </h2>
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="Digite o username do usuário"
            value={username}
            onChange={handleUserNameChange}
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            min="1"
            value={inviteCount}
            onChange={(e) => setInviteCount(Number(e.target.value))}
            className="w-20 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={grantInvite}
            className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition duration-200 w-full md:w-auto"
          >
            Conceder
          </button>
        </div>

        <h2 className="text-xl font-semibold mb-3 text-gray-800">
          Conceder Convites para Todos
        </h2>
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            type="number"
            min="1"
            value={inviteCountForAll}
            onChange={(e) => setInviteCountForAll(Number(e.target.value))}
            className="w-20 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Qtd. para todos"
          />
          <button
            onClick={grantToAll}
            className="bg-green-600 text-white p-2 rounded-md hover:bg-green-700 transition duration-200 w-full md:w-auto"
            disabled={loading}
          >
            {loading ? "Processando..." : "Conceder"}
          </button>
        </div>

        <h2 className="text-lg font-semibold mb-2">Usuários</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4 border-b">Anfitrião</th>
                <th className="py-2 px-4 border-b">Convidado</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="py-2 px-4">{user.inviter.username}</td>
                    <td className="py-2 px-4">{user.email}</td>
                    <td
                      className={`py-2 px-4 font-semibold ${
                        user.status === "accepted"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {user.status}
                    </td>
                    <td className="py-2 px-4">
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => revokeInvite(user.id)}
                      >
                        Revogar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {loading && <p className="mt-4 text-blue-500">Carregando...</p>}
      </div>
    </div>
  );
}
