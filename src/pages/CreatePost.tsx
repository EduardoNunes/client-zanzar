import Cookies from "js-cookie";
import { Camera, Upload } from "lucide-react";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const capturedFile = await openCamera();
      if (capturedFile) {
        setFile(capturedFile);
        const objectUrl = URL.createObjectURL(capturedFile);
        setPreview(objectUrl);
      }
    } catch (err) {
      toast.error("Erro ao capturar imagem");
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Por favor, selecione uma imagem ou vídeo.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const profileId = Cookies.get("profile_id");
      if (!profileId) {
        navigate("/login");
        return;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${profileId}/${fileName}`;

      await createPostWithMediaReq(profileId, file, caption, filePath);
      navigate("/");
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
      {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">Mídia</label>
          <div className="flex flex-col items-center justify-center w-full">
            <label className="w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors flex flex-col items-center justify-center relative overflow-hidden">
              {preview ? (
                <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Clique para fazer upload</span></p>
                  <p className="text-xs text-gray-500">PNG, JPG ou MP4 (Máx. 10MB)</p>
                </div>
              )}
              <input type="file" className="hidden" accept="image/*, video/mp4" onChange={handleFileChange} />
            </label>
          </div>
          <div className="mt-4 flex gap-4">
            <button
              type="button"
              onClick={handleCameraCapture}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">
              <Camera className="w-5 h-5" />
              Capturar Foto
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}