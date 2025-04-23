import { X } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useGlobalContext } from "../context/globalContext";
import AddProductVariants from "./AddProductVariants";
import { addProductReq } from "../requests/productRequests";

type Variant = {
  color: string;
  size: string;
  stock: number;
  price: number;
  priceWithTax: number;
  images: File[];
  added: boolean;
};

export default function AddProduct({ productFeePercentage, userStoreId }: { productFeePercentage?: number; userStoreId?: string }) {
  const { token, profileId } = useGlobalContext();
  const { setIsOpen } = useGlobalContext();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [variants, setVariants] = useState<Variant[]>([
    { color: "", size: "", stock: 0, price: 0, priceWithTax: 0, images: [], added: false },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const filteredVariants = variants.filter((v) => v.added === true);

    if (filteredVariants.length === 0) {
      toast.info("Pelo menos uma variante deve ser adicionada");
      return;
    }

    console.log("Salvando produto:", name, description, categoryName, filteredVariants)

    const addProductResponse = await addProductReq(name, description, categoryName, filteredVariants, token, profileId, userStoreId);

    if (addProductResponse.success) {
      toast.success("Produto salvo com sucesso");
      setIsOpen(false);
    } else {
      toast.error("Erro ao salvar produto");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-start bg-black/30 p-4">
      <form
        className="max-w-2xl w-full bg-white p-6 rounded-lg shadow mt-10 h-[90vh] overflow-y-auto"
        onSubmit={handleSubmit}
      >
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Adicionar Produto</h1>
          <button type="button" onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-1">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
        </div>

        <div className="mb-2">
          <label className="block text-gray-700 font-semibold mb-1">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-1">Categoria</label>
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
        </div>

        <AddProductVariants variants={variants} setVariants={setVariants} productFeePercentage={productFeePercentage} />

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          Salvar Produto
        </button>
      </form>
    </div>
  );
}

