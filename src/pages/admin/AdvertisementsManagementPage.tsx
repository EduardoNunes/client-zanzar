import { Eye, Loader2, MousePointer, Pencil, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { AdvertisementForm } from "../../components/AdvertisementForm";
import {
  Advertisement,
  deleteAdvertisementReq,
  getAdvertisementsReq,
} from "../../requests/advertisementsManagementRequests";

export const AdvertisementsManagementPage: React.FC = () => {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdvertisements = async () => {
    try {
      setIsLoading(true);
      const ads = await getAdvertisementsReq();
      setAdvertisements(ads);
    } catch (error) {
      console.error("Error fetching advertisements:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this advertisement?")) return;

    try {
      await deleteAdvertisementReq(id);
      fetchAdvertisements();
    } catch (error) {
      console.error("Error deleting advertisement:", error);
    }
  };

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">
          Gerenciamneto de Anúncios
        </h1>
        <button
          onClick={() => {
            setEditingAd(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Criar Anúncio
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-indigo-600" size={48} />
        </div>
      ) : advertisements.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          Nenhum anúncio encontrado. Crie um anúncio!
        </div>
      ) : (
        <div className="grid gap-4">
          {advertisements.map((ad) => (
            <div
              key={ad.id}
              className="bg-white shadow-md rounded-lg p-6 flex justify-between items-start"
            >
              <div className="flex-grow">
                <div className="flex items-center space-x-4 mb-2">
                  {ad.mediaUrl && (
                    <img
                      src={ad.mediaUrl}
                      alt={ad.title}
                      className="h-16 w-16 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h2 className="text-xl font-semibold">{ad.title}</h2>
                    {ad.description && (
                      <p className="text-gray-600 text-sm">{ad.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                  <span>
                    Início: {new Date(ad.startDate).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>Fim: {new Date(ad.endDate).toLocaleDateString()}</span>
                </div>
                {ad.scheduleStart && ad.scheduleEnd && (
                  <p className="text-sm">
                    <span className="font-medium">Schedule:</span>{" "}
                    {ad.scheduleStart} - {ad.scheduleEnd}
                  </p>
                )}
                {ad.dailyLimit && (
                  <p className="text-sm mb-2">
                    <span className="font-medium">Limite Diário:</span>{" "}
                    {ad.dailyLimit}
                  </p>
                )}

                <div className="flex items-center space-x-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      ad.active ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <span className="text-sm">
                    {ad.active ? "Ativo" : "Inativo"}
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      ad.showOnStartup ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <span className="text-sm">
                    {ad.showOnStartup
                      ? "Mostrar no início"
                      : "Não mostrar no início"}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {ad.views_count} Visualizações
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MousePointer className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {ad.clicks_count} Cliques
                    </span>
                  </div>
                </div>

                {ad.linkUrl && (
                  <div className="flex items-center space-x-2 mt-2">
                    <MousePointer className="h-4 w-4 text-gray-500" />
                    <a
                      href={ad.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate max-w-[200px]"
                    >
                      {ad.linkUrl}
                    </a>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => handleEdit(ad)}
                  className="text-blue-600 hover:bg-blue-50 p-2 rounded-full"
                  title="Edit"
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(ad.id)}
                  className="text-red-600 hover:bg-red-50 p-2 rounded-full"
                  title="Delete"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdvertisementForm
        editingAd={editingAd}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        fetchAdvertisements={fetchAdvertisements}
      />
    </div>
  );
};
