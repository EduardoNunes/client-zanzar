import { Trash2, Upload } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import AddressForm from "../components/AddressForm";
import { useGlobalContext } from "../context/globalContext";
import { createStoreReq } from "../requests/storeRequests";
import { logOut } from "../utils/logout";

export default function CreateStore() {
  const { token, profileId } = useGlobalContext();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [hasAddress, setHasAddress] = useState(false);
  const [address, setAddress] = useState({
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Brasil",
  });

  const navigate = useNavigate();
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file && file.type.startsWith("image/")) {
      const objectURL = URL.createObjectURL(file);
      setLogoPreview(objectURL);
      setLogo(file);      
    } else {
      setLogo(null);
      setLogoPreview("");
      toast.info("O logo deve ser um arquivo PNG, JPG ou JPEG com tamanho máximo de 10MB.");
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file && file.type.startsWith("image/")) {
      const objectURL = URL.createObjectURL(file);
      setBannerPreview(objectURL);
      setBanner(file);      
    } else {
      setBanner(null);
      setBannerPreview("");
      toast.info("O banner deve ser PNG, JPG ou JPEG com até 10MB.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      toast.info("Por favor, informe o nome da Lojinha.");
      return;
    }

    if (!description) {
      toast.info("Por favor, informe a descrição da Lojinha.");
      return;
    }

    if (!logo || !banner) {
      toast.info("Por favor, adicione as mídias de Logo e Banner.");
      return;
    }

    if (logo.size > MAX_IMAGE_SIZE || banner.size > MAX_IMAGE_SIZE) {
      toast.info("O tamanho máximo para imagens é de 10MB.");
      return;
    }

    const loadingToastCreate = toast.loading("Criando loja...");

    const data = {
      name,
      description,
      logo,
      banner,
      address: hasAddress ? address : undefined,
    };

    try {
      if (!profileId || !token) {
        toast.dismiss(loadingToastCreate);
        logOut(navigate);
        return;
      }

      const response = await createStoreReq(data, profileId, token);
      toast.success("Loja criada com sucesso!");
      navigate(`/user-store/${response.createdStore.slug}`);
    } catch (err: any) {
      toast.dismiss(loadingToastCreate);
      toast.error(err.message || "Erro ao criar loja.");
    } finally {
      toast.dismiss(loadingToastCreate);
    }
  };

  return (
    <div className="flex justify-center items-center bg-gray-50 min-h-screen">
      <form
        className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Criando Loja
        </h2>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            rows={3}
            required
          />
        </div>

        {/* Endereço */}
        <div className="mb-4 mt-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="hasAddress"
                name="addressOption"
                checked={hasAddress}
                onChange={() => setHasAddress(true)}
                className="accent-indigo-500"
              />
              <label htmlFor="hasAddress" className="cursor-pointer">
                Preencher endereço
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="noAddress"
                name="addressOption"
                checked={!hasAddress}
                onChange={() => setHasAddress(false)}
                className="accent-indigo-500"
              />
              <label htmlFor="noAddress" className="cursor-pointer">
                Não tem endereço
              </label>
            </div>
          </div>

          {hasAddress && (
            <div className="mt-4">
              <AddressForm address={address} setAddress={setAddress} />
            </div>
          )}
        </div>

        {/* Logo */}
        <div className="flex flex-col items-center justify-center w-full mb-4">
          <h1 className="block w-full text-gray-700 font-semibold mb-2">Logo da loja</h1>
          <label className={`w-48 h-48 border-2 border-dashed rounded-lg cursor-pointer ${logoPreview ? "border-transparent" : "border-gray-300 hover:border-indigo-400"} transition-colors duration-200 ease-in-out flex flex-col items-center justify-center relative overflow-hidden`}>
            {logoPreview ? (
              <img src={logoPreview} alt="Preview do Logo" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Clique para fazer upload</span>
                </p>
                <p className="text-xs text-gray-500">PNG, JPG ou JPEG (Máx. 10MB)</p>
              </div>
            )}
            <input
              type="file"
              accept="image/png, image/jpg, image/jpeg"
              onChange={handleLogoChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {logoPreview && (
              <button
                type="button"
                onClick={() => {
                  setLogo(null);
                  setLogoPreview("");
                }}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 z-20"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </label>
        </div>

        {/* Banner */}
        <div className="flex flex-col items-center justify-center w-full mb-4">
          <h1 className="block w-full text-gray-700 font-semibold mb-2">Banner da loja</h1>
          <label className={`w-full h-48 border-2 border-dashed rounded-lg cursor-pointer ${bannerPreview ? "border-transparent" : "border-gray-300 hover:border-indigo-400"} transition-colors duration-200 ease-in-out flex flex-col items-center justify-center relative overflow-hidden`}>
            {bannerPreview ? (
              <img src={bannerPreview} alt="Preview do Banner" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Clique para fazer upload</span>
                </p>
                <p className="text-xs text-gray-500">PNG, JPG ou JPEG (Máx. 10MB)</p>
                <p className="text-xs text-gray-500">Formato ideal da imagem é 16:9</p>
              </div>
            )}
            <input
              type="file"
              accept="image/png, image/jpg, image/jpeg"
              onChange={handleBannerChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {bannerPreview && (
              <button
                type="button"
                onClick={() => {
                  setBanner(null);
                  setBannerPreview("");
                }}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 z-20"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </label>
        </div>

        {/* Botão */}
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Criar Loja
        </button>
      </form>
    </div>
  );
}
