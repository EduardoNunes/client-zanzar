import { ShoppingCart } from "lucide-react";
import React, { useState } from "react";
import ProductModal from "./ProductModal";
import RatingStars from "./RatingStars";
import formatCurrencyInput from "../utils/formatRealCoin";

interface ProductCardProps {
  description: string;
  id: string;
  name: string;
  productSubCategory: SubCategoryProps;
  rating: number;
  ratingCount: number;
  totalSold: number;
  variations: VariationsProps[];
  onImageClick: () => void;
  onCartClick: () => void;
}

interface SubCategoryProps {
  category: CategoryProps;
  id: string;
  name: string;
}

interface CategoryProps {
  id: string;
  name: string;
}

interface VariationsProps {
  colorName: string;
  colorCode: string;
  id: string;
  images: ImageProps[];
  productId: string;
  sizes: SizesProps[];
}

interface SizesProps {
  id: string;
  price: number;
  basePrice: number;
  stock: number;
}

interface ImageProps {
  id: string;
  url: string;
  position: number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  description,
  id,
  name,
  productSubCategory,
  rating,
  ratingCount,
  totalSold,
  variations,
  onImageClick,
  onCartClick,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  function formatCurrencyWithSmallCents(value: string) {
    const formatted = formatCurrencyInput(value);
    const [main, cents] = formatted.split(',');
    
    return (
      <>
        {main},
        <span className="text-xs font-normal">{cents}</span>
      </>
    );
  }

  return (
    <div
      onClick={() => setIsModalOpen(true)}
      className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center w-full hover:shadow-lg transition-shadow"
    >
      {isModalOpen &&
        <ProductModal
          product={{
            id,
            name,
            description,
            totalSold,
            rating,
            ratingCount,
            variations
          }}
          onClose={() => setIsModalOpen(false)}
          onAddToCart={(productId, variation, quantity) => {
            // lógica do carrinho
            setIsModalOpen(false);
          }}
        />
      }
      <div className="relative w-full flex justify-center mb-2">
        <img
          src={variations[0].images[0].url || "/placeholder.png"}
          alt={name}
          className="rounded-lg object-cover w-48 h-48 cursor-pointer border"
          onClick={onImageClick}
        />
        <button
          onClick={onCartClick}
          className="absolute bottom-2 right-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2 shadow-md focus:outline-none"
          title="Adicionar ao carrinho"
        >
          <ShoppingCart size={16} />
        </button>
      </div>
      <div className="w-full text-left">
        <h3 className="text-lg font-bold mb-1 text-gray-900 truncate" title={name}>{name}</h3>
        <div className="w-full">
          <span
            className="w-full text-gray-700 text-justify text-sm cursor-pointer select-none"
            onClick={() => setDescExpanded((v) => !v)}
            title={descExpanded ? "Clique para recolher" : "Clique para expandir"}
          >
            {descExpanded
              ? description
              : description.length > 30
                ? description.substring(0, 30) + "..."
                : description}
            {description.length > 30 && (
              <span className="ml-1 text-indigo-600 underline">
                {descExpanded ? "menos" : "mais"}
              </span>
            )}
          </span>
        </div>
        
        <div className="flex items-center mt-2 mb-1">
          <span className="font-semibold text-gray-700 text-sm mr-2">
            {formatCurrencyWithSmallCents(String(variations[0].sizes[0].price))}
          </span>
        </div>

        <div className={`flex items-center mb-1 ${rating === 0 ? 'hidden' : ''}`}>
          <RatingStars rating={ratingCount / rating} />
          <span className="ml-2 text-gray-500 text-sm">({ratingCount / rating})</span>
        </div>
        <div className="text-gray-600 text-xs">Total vendidos: <span className="font-bold">{totalSold}</span></div>
      </div>
    </div>
  );
};

export default ProductCard;