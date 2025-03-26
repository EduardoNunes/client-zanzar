import { useEffect, useState } from "react";
import {
  getAllInvitesReq,
  grantInviteReq,
  sendInvitesToAllUsersReq,
  revokeInviteReq,
} from "../../requests/invitesManagementRequests";
import { toast } from "react-toastify";
import { useGlobalContext } from "../../context/globalContext";
import { Loader2 } from "lucide-react";

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
  const { token } = useGlobalContext();
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUserName] = useState("");
  const [inviteCount, setInviteCount] = useState(1);
  const [inviteCountForAll, setInviteCountForAll] = useState(1);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    if (!token) {
      toast.error("Token de acesso não encontrado.");
      return;
    }
    setUsersLoading(true);
    try {
      const response = await getAllInvitesReq(page, token);
      if (response) {
        setUsers(response.data);
        setTotalPages(response.totalPages);
      }
    } catch (error) {
      // Error is already handled in getAllInvitesReq
    } finally {
      setUsersLoading(false);
    }
  };

  // Conceder convites a um usuário específico
  const grantInvite = async () => {
    if (!token) {
      toast.error("Token de acesso não encontrado.");
      return;
    }
    setLoading(true);
    try {
      const response = await grantInviteReq(
        username.toLowerCase(),
        inviteCount,
        token
      );
      if (response) {
        toast.success(response.message);
        setUserName("");
        setInviteCount(1);
      }
    } catch (error) {
      // Error is already handled in grantInviteReq
    } finally {
      setLoading(false);
    }
  };

  // Conceder convites para todos os usuários
  const grantToAll = async () => {
    if (!token) {
      toast.error("Token de acesso não encontrado.");
      return;
    }
    setLoading(true);
    try {
      const response = await sendInvitesToAllUsersReq(
        inviteCountForAll,
        token
      );
      if (response) {
        toast.success(response.message);
        setInviteCountForAll(1);
      }
    } catch (error) {
      // Error is already handled in sendInvitesToAllUsersReq
    } finally {
      setLoading(false);
    }
  };

  const revokeInvite = async (id: string) => {
    if (!token) {
      toast.error("Token de acesso não encontrado.");
      return;
    }
    setLoading(true);
    try {
      const response = await revokeInviteReq(id, token);
      if (response) {
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user.id !== id)
        );
        toast.success(response.message);
      }
    } catch (error) {
      // Error is already handled in revokeInviteReq
    } finally {
      setLoading(false);
    }
  };

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "");

    setUserName(sanitizedValue);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
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
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processando...</span>
              </div>
            ) : (
              "Conceder"
            )}
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
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processando...</span>
              </div>
            ) : (
              "Conceder"
            )}
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
              {usersLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-4">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Carregando...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4">
                    Nenhum usuário encontrado.
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
                        disabled={loading}
                      >
                        {loading && (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                          </div>
                        )}
                        Revogar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 space-x-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50"
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`px-3 py-1 rounded-md border ${
                    pageNumber === page
                      ? "bg-blue-500 text-white"
                      : "border-gray-300"
                  }`}
                >
                  {pageNumber}
                </button>
              )
            )}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
