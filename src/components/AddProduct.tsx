import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useGlobalContext } from "../context/globalContext";
import AddProductVariants from "./AddProductVariants";
import { addProductReq, loadCategoriesReq, loadSubCategoriesReq, createCategoryReq, createSubCategoryReq } from "../requests/productRequests";
import { ProductVariationsProps } from "../types/ProductVariant";
import { addProductSchema } from "../validations/addProductSchema";
import { ValidationError } from "yup";

export default function AddProduct({ productFeePercentage, userStoreId }: { productFeePercentage?: number; userStoreId?: string }) {
  const { token, profileId } = useGlobalContext();
  const { setIsOpen } = useGlobalContext();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newSubCategory, setNewSubCategory] = useState("");
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [variants, setVariants] = useState<ProductVariationsProps[]>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    profileId &&
      loadCategoriesReq(profileId, token).then((res: any) => {
        setCategories(res);
      });
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    fetchSubCategories(categoryId);
  }

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

  const fetchSubCategories = async (categoryId: string) => {
    profileId &&
      loadSubCategoriesReq(profileId, token, categoryId).then((res: any) => {
        setSubCategories(res);
      });
  };

  const handleCreateSubCategory = async (newSubCategory: string) => {
    if (!newSubCategory) {
      toast.info("Por favor, insira uma nova subcategoria.");
      return;
    }

    profileId &&
      createSubCategoryReq(newSubCategory, selectedCategory, profileId, token).then(() => {
        fetchSubCategories(selectedCategory);
        toast.success("Subcategoria criada com sucesso!");
        setNewSubCategory("");
      });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      addProductSchema.validateSync({
        name,
        description,
        selectedCategory,
        selectedSubCategory,
        variants,
      });

    } catch (error) {
      if (error instanceof ValidationError) {
        toast.error(error.errors[0]);
      } else {
        toast.info("Erro inesperado ao validar o produto.");
      }
      return;
    }

    await addProductReq(
      name,
      description,
      selectedCategory,
      selectedSubCategory,
      variants,
      token,
      profileId,
      userStoreId
    );
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
          <label className="block text-gray-700 font-semibold mb-1">Produto</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent h-[40px]"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Selecionar categoria
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent h-[40px]"
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
                  {category.name}
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
        <div className="flex flex-col items-end">
          <label className="block w-full text-gray-700 text-sm font-semibold my-2">
            Criar categoria
          </label>
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Nova categoria"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent h-[40px]"
          />
          <button
            type="button"
            onClick={() => handleCreateCategory(newCategory)}
            className="flex-1 w-2/3 h-10 bg-green-700 my-4 text-white px-4 py-2 rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Criar categoria
          </button>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Selecionar subcategoria
          </label>
          <select
            value={selectedSubCategory}
            onChange={(e) => setSelectedSubCategory(e.target.value)}
            className="w-full px-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent h-[40px]"
          >
            <option
              value=""
              disabled
              className="text-gray-700 text-sm font-semibold"
            >
              Selecione uma subcategoria
            </option>
            {subCategories.length > 0 ? (
              subCategories.map((subCategory) => (
                <option
                  key={subCategory.id}
                  value={subCategory.id}
                  className="text-gray-700 text-sm font-semibold hover:bg-gray-50"
                >
                  {subCategory.name}
                </option>
              ))
            ) : (
              <option
                value=""
                disabled
                className="text-gray-700 text-sm font-semibold"
              >
                Nenhuma subcategoria encontrada
              </option>
            )}
          </select>
        </div>
        <div className="flex flex-col items-end">
          <label className="block w-full text-gray-700 text-sm font-semibold my-2">
            Criar subcategoria
          </label>
          <input
            value={newSubCategory}
            onChange={(e) => setNewSubCategory(e.target.value)}
            placeholder="Nova subcategoria"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent h-[40px]"
          />
          <button
            type="button"
            onClick={() => handleCreateSubCategory(newSubCategory)}
            className="flex-1 w-2/3 h-10 bg-green-700 my-4 text-white px-4 py-2 rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Criar subcategoria
          </button>
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

