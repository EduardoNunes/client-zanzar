import { Upload, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  Advertisement,
  createAdvertisementReq,
  updateAdvertisementReq,
} from "../requests/advertisementsManagementRequests";
import { useGlobalContext } from "../context/globalContext";

interface AdvertisementFormProps {
  editingAd?: Advertisement | null;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  fetchAdvertisements: () => Promise<void>;
}

export const AdvertisementForm: React.FC<AdvertisementFormProps> = ({
  editingAd,
  isModalOpen,
  setIsModalOpen,
  fetchAdvertisements,
}) => {
  const { token, isLoadingToken } = useGlobalContext();
  const [form, setForm] = useState<{
    title: string;
    description: string;
    mediaUrl: string;
    mediaType: "video" | "image";
    linkUrl: string;
    startDate: string;
    endDate: string;
    dailyLimit: string;
    userLimitShow: string;
    timeInterval: string;
    scheduleStart: string;
    scheduleEnd: string;
    showOnStartup: boolean;
    active: boolean;
    file: File | null;
    mediaPreview: string;
  }>({
    title: "",
    description: "",
    mediaUrl: "",
    mediaType: "image",
    linkUrl: "",
    startDate: "",
    endDate: "",
    dailyLimit: "",
    userLimitShow: "",
    timeInterval: "",
    scheduleStart: "",
    scheduleEnd: "",
    showOnStartup: true,
    active: true,
    file: null as File | null,
    mediaPreview: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoadingToken && !token) {
      toast.error("Token não encontrado.");
      return;
    }
  }, [isLoadingToken, token]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);

      const filePreviewUrl = URL.createObjectURL(file);
      const fileType = file.type.startsWith("video/") ? "video" : "image";

      setForm((prev) => ({
        ...prev,
        mediaType: fileType,
        file: file,
        mediaPreview: filePreviewUrl,
      }));
    } catch (error) {
      console.error("Erro ao carregar a pré-visualização:", error);
      toast.error("Erro ao carregar a pré-visualização.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!token) {
      toast.error("Token não encontrado.");
      return;
    }

    try {
      if (!form.title || !form.startDate || !form.endDate) {
        toast.error("Por favor, preencha todos os campos obrigatórios");
        return;
      }

      const startDate = new Date(form.startDate);
      const endDate = new Date(form.endDate);

      if (startDate > endDate) {
        toast.error("Data de início não pode ser maior que a data de término");
        return;
      }

      if (editingAd) {
        await updateAdvertisementReq(
          editingAd.id,
          {
            ...form,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            scheduleStart: form.scheduleStart
              ? new Date(form.scheduleStart).toISOString()
              : undefined,
            scheduleEnd: form.scheduleEnd
              ? new Date(form.scheduleEnd).toISOString()
              : undefined,
            file: form.file === null ? undefined : form.file,
            mediaType: form.mediaType,
          },
          token
        );
      } else {
        await createAdvertisementReq(
          {
            ...form,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            scheduleStart: form.scheduleStart
              ? new Date(form.scheduleStart).toISOString()
              : undefined,
            scheduleEnd: form.scheduleEnd
              ? new Date(form.scheduleEnd).toISOString()
              : undefined,
            file: form.file || undefined,
            mediaType: form.mediaType,
          },
          token
        );
      }

      setForm({
        title: "",
        description: "",
        mediaUrl: "",
        mediaType: "image",
        linkUrl: "",
        startDate: "",
        endDate: "",
        dailyLimit: "",
        userLimitShow: "",
        timeInterval: "",
        scheduleStart: "",
        scheduleEnd: "",
        showOnStartup: true,
        active: true,
        file: null,
        mediaPreview: "",
      });

      await fetchAdvertisements();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao enviar o formulário:", error);
      toast.error("Falha ao enviar o formulário");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (editingAd) {
      const startDate = new Date(editingAd.startDate)
        .toISOString()
        .split("T")[0];
      const endDate = new Date(editingAd.endDate).toISOString().split("T")[0];

      let mediaPreview = "";
      if (editingAd.mediaUrl) {
        mediaPreview = editingAd.mediaUrl;
      }

      setForm({
        title: editingAd.title,
        description: editingAd.description || "",
        mediaUrl: editingAd.mediaUrl,
        mediaType: editingAd.mediaType,
        linkUrl: editingAd.linkUrl || "",
        startDate: startDate,
        endDate: endDate,
        dailyLimit: editingAd.dailyLimit || "",
        userLimitShow: editingAd.userLimitShow || "",
        timeInterval: editingAd.timeInterval || "",
        scheduleStart: editingAd.scheduleStart || "",
        scheduleEnd: editingAd.scheduleEnd || "",
        showOnStartup: editingAd.showOnStartup,
        active: editingAd.active,
        file: null,
        mediaPreview: mediaPreview,
      });
    }
  }, [editingAd]);

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-3">
      <div className="bg-white p-8 rounded-lg h-[95%] w-full max-w-md relative overflow-y-auto">
        <button
          onClick={() => setIsModalOpen(false)}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          <X className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold mb-6">
          {editingAd ? "Editar Anúncio" : "Criar Anúncio"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Form fields remain the same as in the original component */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição (Opcional)
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link URL (opcional)
            </label>
            <input
              type="url"
              value={form.linkUrl}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, linkUrl: e.target.value }))
              }
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de início
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, startDate: e.target.value }))
                }
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de término
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Media
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*, video/*"
                onChange={handleFileUpload}
                className="hidden"
                id="fileUpload"
              />
              <label
                htmlFor="fileUpload"
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
              >
                <Upload className="mr-2 h-5 w-5" />
                Subir Mídia
              </label>
              {form.mediaPreview && (
                <div className="relative">
                  <img
                    src={form.mediaPreview}
                    alt="Media Preview"
                    className="h-20 w-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        file: null,
                        mediaPreview: "",
                      }))
                    }
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Limite diário (Opcional)
              </label>
              <input
                type="number"
                value={form.dailyLimit}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, dailyLimit: e.target.value }))
                }
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showOnStartup"
                  checked={form.showOnStartup}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      showOnStartup: e.target.checked,
                    }))
                  }
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label
                  htmlFor="showOnStartup"
                  className="text-sm text-gray-700"
                >
                  Mostrar ao iniciar
                </label>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={form.active}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, active: e.target.checked }))
                  }
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="active" className="text-sm text-gray-700">
                  Ativo
                </label>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Limite por usuário (Opcional)
              </label>
              <input
                type="number"
                value={form.userLimitShow}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    userLimitShow: e.target.value,
                  }))
                }
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Intervalo de exibição por minuto (Opcional)
              </label>
              <input
                type="number"
                value={form.timeInterval}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, timeInterval: e.target.value }))
                }
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Submitting..." : editingAd ? "Atualizar" : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
