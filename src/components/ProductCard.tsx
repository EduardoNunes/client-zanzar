import { ShoppingCart } from "lucide-react";
import React, { useState } from "react";
import formatCurrencyWithSmallCents from "../utils/centsReduct";
import ProductModal from "./ProductModal";
import RatingStars from "./RatingStars";
import { ProductVariationsProps } from "../types/ProductVariant";

interface ProductCardProps {
  description: string;
  id: string;
  name: string;
  productSubCategory: SubCategoryProps;
  rating: number;
  ratingCount: number;
  totalSold: number;
  variations: ProductVariationsProps[];
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

const ProductCard: React.FC<ProductCardProps> = ({
  description,
  id,
  name,
  rating,
  ratingCount,
  totalSold,
  variations,
  onCartClick,
}) => {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  return (
    <div
      onClick={() => setIsProductModalOpen(true)}
      className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center w-full hover:shadow-lg transition-shadow"
    >
      {isProductModalOpen &&
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
          onClose={() => setIsProductModalOpen(false)}
          onAddToCart={(productId, variation, quantity) => {
            // lógica do carrinho
            console.log(productId, variation, quantity);
            /* setIsProductModalOpen(false); */
          }}
        />
      }
      <div className="relative w-full flex justify-center mb-2">
        <img
          src={variations[0].images[0].url || "/placeholder.png"}
          alt={name}
          className="rounded-lg object-cover w-full h-full cursor-pointer border"
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
            className="w-full text-gray-700 text-justify text-sm cursor-pointer select-none line-clamp-2"
            style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
            onClick={() => setDescExpanded((v) => !v)}
            title={descExpanded ? "Clique para recolher" : "Clique para expandir"}
          >
            {descExpanded ? description : description}
            {description.length > 0 && (
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