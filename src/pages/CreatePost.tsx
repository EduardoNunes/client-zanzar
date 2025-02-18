import Cookies from "js-cookie";
import { Camera, Loader2, Upload, Video } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { openCamera } from "../components/OpenCamera";
import {openVideoRecorder} from "../components/OpenVideoRecorder";
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

  const handleVideoCapture = async () => {
    try {
      const capturedFile = await openVideoRecorder(); // Chama a função openVideoRecorder
      if (capturedFile) {
        setFile(capturedFile);
        const objectUrl = URL.createObjectURL(capturedFile);
        setPreview(objectUrl);
      }
    } catch (err) {
      toast.error("Erro ao gravar vídeo");
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
      <h1 className="text-2xl font-bold mb-6">Criar Nova Postagem</h1>
      {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">Mídia</label>
          <div className="flex flex-col items-center justify-center w-full">
            <label className="w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors flex flex-col items-center justify-center relative overflow-hidden">
              {preview ? (
                <video src={preview} controls className="absolute inset-0 w-full h-full object-cover" />
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
            <button
              type="button"
              onClick={handleVideoCapture}
              className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600">
              <Video className="w-5 h-5" />
              Gravar Vídeo
            </button>
          </div>
        </div>
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">Legenda</label>
          <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Escreva uma legenda para sua postagem..." className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 min-h-[100px]" />
        </div>
        <div className="flex gap-4">
          <button type="button" onClick={() => { if (preview) { URL.revokeObjectURL(preview); } navigate("/"); }} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Cancelar</button>
          <button type="submit" disabled={loading || !file} className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            {loading ? (<div className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /><span>Publicando...</span></div>) : "Publicar"}
          </button>
        </div>
      </form>
    </div>
  );
}
