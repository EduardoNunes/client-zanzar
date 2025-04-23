import { X } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useGlobalContext } from "../context/globalContext";
import AddProductVariants from "./AddProductVariants";

export default function AddProduct({ productFeePercentage }: { productFeePercentage?: number }) {
  const { setIsOpen } = useGlobalContext();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryName, setCategoryName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submission logic will be implemented later
    toast.info("Produto salvo (simulado)");
  };

  return (
    <form className="absolute top-0 left-0 max-w-2xl mx-auto bg-white p-6 rounded-lg shadow" onSubmit={handleSubmit}>
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

      <AddProductVariants productFeePercentage={productFeePercentage} />
      
      <button
        type="submit"
        className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        Salvar Produto
      </button>
    </form>
  );
}

