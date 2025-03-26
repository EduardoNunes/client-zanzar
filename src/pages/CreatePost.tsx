import { Camera as CameraIcon, Loader2, Trash2, Upload } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { openCamera } from "../components/OpenCamera";
import {
  createPostWithMediaReq,
  loadCategoriesReq,
  createCategoryReq,
} from "../requests/postsRequests";
import { useGlobalContext } from "../context/globalContext";

export default function CreatePost() {
  const { profileId, token } = useGlobalContext();
  const navigate = useNavigate();
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_VIDEO_SIZE = 30 * 1024 * 1024; // 30MB
  const MAX_VIDEO_TIME = 15; // 15 segundos

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    profileId &&
      loadCategoriesReq(profileId, token).then((res) => {
        setCategories(res);
      });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(null);
    setPreview("");
    setFileType(null);

    const currentFile = event.target.files?.[0];
    if (!currentFile) {
      toast.info("Nenhum arquivo selecionado.");
      event.target.value = "";
      return;
    }

    if (currentFile.type.startsWith("image/")) {
      setFileType("image");

      const objectUrl = URL.createObjectURL(currentFile);
      setPreview(objectUrl);

      setFile(currentFile);
      event.target.value = "";
    } else if (currentFile.type.startsWith("video/")) {
      setFileType("video");

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setFile(currentFile);

        const videoElement = document.createElement("video");
        videoElement.src = reader.result as string;

        videoElement.onloadedmetadata = () => {
          const duration = videoElement.duration;
          console.log(`Duração do vídeo: ${duration} segundos`);

          setVideoDuration(duration);
        };

        event.target.value = "";
      };

      reader.onerror = () => {
        toast.error("Erro ao carregar vídeo");
        event.target.value = "";
      };
      reader.readAsDataURL(currentFile);
    } else {
      toast.info("Formato de arquivo não suportado.");
      event.target.value = "";
    }
    setError("");
  };

  const handleOpenPhoto = async () => {
    const capturedFile = await openCamera();
    if (capturedFile) {
      setFile(capturedFile);
      const objectUrl = URL.createObjectURL(capturedFile);
      setPreview(objectUrl);
    }
  };

  /*   const handleOpenVideo = async () => {
      const capturedFile = await openCamera();
      if (capturedFile) {
        setFile(capturedFile);
        const objectUrl = URL.createObjectURL(capturedFile);
        setPreview(objectUrl);
      }
    };   */

  const handleCreateCategory = async (newCategory: string) => {
    if (!newCategory) {
      toast.info("Por favor, insira uma nova categoria.");
      return;
    }
    profileId &&
      createCategoryReq(newCategory, profileId, token).then(() => {
        fetchCategories();
        toast.success("Categoria criada com sucesso!");
        setNewCategory("");
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.info("Por favor, selecione uma mídia.");
      return;
    }

    if (!selectedCategory) {
      toast.info("Por favor, selecione uma categoria.");
      return;
    }

    if (fileType === "image" && file.size > MAX_IMAGE_SIZE) {
      toast.info("O tamanho máximo para imagens é de 10MB.");
      return;
    } else if (fileType === "video" && file.size > MAX_VIDEO_SIZE) {
      toast.info("O tamanho máximo para videos é de 30MB.");
      return;
    } else if (videoDuration && videoDuration > MAX_VIDEO_TIME) {
      toast.info("O tempo máximo para videos é de 15 segundos.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (!profileId) {
        navigate("/login");
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${profileId}/${fileName}`;

      profileId &&
        (await createPostWithMediaReq(
          profileId,
          file,
          caption,
          filePath,
          selectedCategory,
          token
        ).then(() => {
          navigate("/");
        }));
    } catch (error) {
      setError("Erro ao criar postagem. Por favor, tente novamente.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Criar Nova Postagem</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Imagem
          </label>
          <div className="flex flex-col items-center justify-center w-full">
            <label
              className={`w-full h-64 border-2 border-dashed rounded-lg cursor-pointer
                ${
                  preview
                    ? "border-transparent"
                    : "border-gray-300 hover:border-indigo-400"
                }
                transition-colors duration-200 ease-in-out
                flex flex-col items-center justify-center relative overflow-hidden`}
            >
              {preview ? (
                fileType === "video" ? (
                  <video
                    key={preview}
                    src={preview}
                    controls
                    playsInline
                    autoPlay
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={preview}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">
                      Clique para fazer upload
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG ou MP4 (Máx. 30MB, Vídeo até 15s)
                  </p>
                </div>
              )}

              <input
                type="file"
                accept="image/png, image/jpg, image/jpeg, video/mp4"
                onChange={handleFileChange}
                className="hidden"
              />

              {preview && (
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreview("");
                    setFileType(null);
                    setError("");
                    setLoading(false);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </label>
          </div>
          <div className="flex space-x-4 mt-4">
            <button
              type="button"
              onClick={() => handleOpenPhoto()}
              disabled={!!preview}
              className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center 
                ${
                  preview
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
            >
              <CameraIcon className="mr-2" /> Capturar Foto
            </button>
            {/* <button
              type="button"
              onClick={() => handleOpenVideo()}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 flex items-center justify-center"
            >
              <CameraIcon className="mr-2" /> Gravar Vídeo
            </button> */}
          </div>
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Legenda
          </label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Escreva uma legenda para sua postagem..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent min-h-[100px]"
          />
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Selecionar categoria
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent h-[40px]"
          >
            <option
              value=""
              disabled
              className="text-gray-700 text-sm font-semibold"
            >
              Selecione uma categoria
            </option>
            {categories.length > 0 ? (
              categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                  className="text-gray-700 text-sm font-semibold hover:bg-gray-50"
                >
                  {category.categories}
                </option>
              ))
            ) : (
              <option
                value=""
                disabled
                className="text-gray-700 text-sm font-semibold"
              >
                Nenhuma categoria encontrada
              </option>
            )}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Criar categoria
          </label>
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Nova categoria"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent h-[40px]"
          />
          <button
            type="button"
            onClick={() => handleCreateCategory(newCategory)}
            className="flex-1 w-1/2 bg-indigo-600 mt-4 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Criar
          </button>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => {
              if (preview) {
                URL.revokeObjectURL(preview);
              }
              navigate("/");
            }}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !file}
            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Publicando...</span>
              </div>
            ) : (
              "Publicar"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
