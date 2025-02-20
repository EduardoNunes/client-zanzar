import Cookies from "js-cookie";
import { Camera, Loader2, Trash2, Upload } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { openCamera } from "../components/OpenCamera";
import { createPostWithMediaReq } from "../requests/postsRequests";

export default function CreatePost() {
  const navigate = useNavigate();
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
 /*  const [, setFileType] = useState<'image' | 'video' | null>(null); */
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Reset previous state
    setFile(null);
    setPreview("");
    /* setFileType(null); */

    const currentFile = event.target.files?.[0];

    if (!currentFile) {
      toast.info("Nenhum arquivo selecionado.");
      event.target.value = '';
      return;
    }

    if (currentFile.type.startsWith('image/')) {
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (currentFile.size > MAX_FILE_SIZE) {
        toast.info("O arquivo de imagem não pode exceder 10MB.");
        event.target.value = '';
        return;
      }

      /* setFileType("image"); */
      setFile(currentFile);

      const objectUrl = URL.createObjectURL(currentFile);
      setPreview(objectUrl);
      event.target.value = '';
    }

   /*  if (currentFile.type.startsWith('video/')) {
      const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB
      if (currentFile.size > MAX_FILE_SIZE) {
        toast.info("O arquivo de vídeo não pode exceder 30MB.");
        event.target.value = '';
        return;
      }

      setFileType("video");
      setFile(currentFile);

      const objectUrl = URL.createObjectURL(currentFile);
      setPreview(objectUrl);
      event.target.value = '';
    } */
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Por favor, selecione uma imagem.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const profileId = Cookies.get("profile_id");

      if (!profileId) {
        navigate("/login");
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${profileId}/${fileName}`;

      profileId &&
        (await createPostWithMediaReq(profileId, file, caption, filePath).then(
          () => {
            navigate("/");
          }
        ));
    } catch (error) {
      setError("Erro ao criar postagem. Por favor, tente novamente.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Criar Nova Postagem1</h1>

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
                ${preview
                  ? "border-transparent"
                  : "border-gray-300 hover:border-indigo-400"
                }
                transition-colors duration-200 ease-in-out
                flex flex-col items-center justify-center relative overflow-hidden`}
            >
              {preview ? /* (
                fileType === "video" ? (
                  <video
                    key={preview}
                    src={preview}
                    controls
                    playsInline
                    autoPlay
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : */ (
                  <img
                    src={preview}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )
               /* ) */ : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Clique para fazer upload</span>
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG ou MP4 (Máx. 30MB, Vídeo até 15s)</p>
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
                   /*  setFileType(null); */
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
                ${preview
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-600'
                }`}
            >
              <Camera className="mr-2" /> Capturar Foto
            </button>
            {/* <button
              type="button"
              onClick={() => handleOpenVideo()}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 flex items-center justify-center"
            >
              <Camera className="mr-2" /> Gravar Vídeo
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
