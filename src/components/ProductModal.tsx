import React, { useState } from "react";
import { X, ShoppingCart } from "lucide-react";
import RatingStars from "./RatingStars";
import formatCurrencyWithSmallCents from "../utils/centsReduct";
import { ProductProps } from "../types/ProductVariant";

const ProductModal: React.FC<ProductProps> = ({ product, onClose, onAddToCart }) => {
  const [selectedVariationIndex, setSelectedVariationIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const variation = product.variations[selectedVariationIndex];
  const images = variation.images;
  const [selectedSizeId, setSelectedSizeId] = useState(
    variation.sizes && variation.sizes.length > 0 ? variation.sizes[0].id : ""
  );

  console.log("PRODUCT", product)

  const handleColorSelect = (index: number) => {
    setSelectedVariationIndex(index);
    setSelectedImageIndex(0);
    setSelectedSizeId(product.variations[index].sizes[0]?.id || "");
  };

  const handleSizeSelect = (sizeId: string) => {
    setSelectedSizeId(sizeId);
  };


  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleAddToCart = () => {
    onAddToCart(product.id, variation, quantity);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 w-full h-full z-50 flex items-center justify-center bg-black bg-opacity-80"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="relative bg-white w-full h-full overflow-y-auto p-6 flex flex-col md:flex-row"
      >
        {/* Imagens/Carrossel */}
        <div className="flex flex-col items-center">
          <div className="relative w-full flex justify-center mb-4">
            <img
              src={images[selectedImageIndex]?.url || "/placeholder.png"}
              alt={product.name}
              className="object-contain max-h-96 w-full rounded-lg"
            />
            <button
              onClick={onClose}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
            >
              <X size={24} />
            </button>
          </div>

          {/* Miniaturas */}
          <div className="flex gap-2 mt-2">
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img.url}
                alt={product.name}
                className={`w-16 h-16 object-cover rounded-lg border-2 ${selectedImageIndex === idx ? "border-indigo-600" : "border-transparent"}`}
                onClick={() => handleImageSelect(idx)}
                style={{ cursor: "pointer" }}
              />
            ))}
          </div>
        </div>

        {/* Detalhes do produto */}
        <div className="flex-1 flex flex-col gap-3 mt-4">
          <div className="flex justify-between">
            <div className="flex flex-col pr-4">
              <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
              <div className="">
                <p className="text-gray-700 text-sm whitespace-pre-line">{product.description}</p>
              </div>
              <div className="text-xl font-bold text-indigo-700 mt-2">
                {formatCurrencyWithSmallCents(String(variation.sizes.find(s => s.size === selectedSizeId)?.price ?? variation.sizes[0].price))}
              </div>
            </div>
            <div className={`flex flex-col mt-2 items-center ${product.rating === 0 ? 'hidden' : ''}`}>
              <div className="flex items-center">
                <RatingStars rating={product.ratingCount / (product.rating || 1)} />
                <span className="ml-2 text-gray-500 text-sm">({product.ratingCount})</span>
              </div>
              <div className="text-gray-600 text-xs mt-2">
                Total vendidos: <span className="font-bold">{product.totalSold}</span>
              </div>
            </div>
          </div>

          {/* Seleção de cor */}
          {product.variations.length > 1 && (
            <div className="mb-2">
              <label className="block font-medium mb-1">Cor: {variation.colorName}</label>
              <div className="flex gap-2">
                {product.variations.map((v, idx) => (
                  <button
                    key={idx}
                    className={`w-8 h-8 rounded-full border-2 ${selectedVariationIndex === idx ? "border-indigo-600" : "border-gray-300"}`}
                    style={{ backgroundColor: v.colorCode || "#fff" }}
                    onClick={() => handleColorSelect(idx)}
                  >
                    {selectedVariationIndex === idx && <span className="block w-full h-full rounded-full border-2 border-indigo-600"></span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Seleção de tamanho */}
          {variation.sizes && variation.sizes.length > 0 && (
            <div className="mb-2">
              <label className="block font-medium mb-1">Tamanho:</label>
              <div className="flex flex-wrap gap-2">
                {variation.sizes.map((size, _) => (
                  <label key={size.id} className={`flex items-center cursor-pointer px-2 py-1 border rounded border-gray-300}`}>
                    <input
                      type="radio"
                      name="product-size"
                      value={size.id}
                      checked={selectedSizeId === size.size}
                      onChange={() => handleSizeSelect(size.size)}
                      className="mr-2"
                    />
                    <span>{size.size}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Seleção de quantidade */}
          <div className="mb-2 flex items-center gap-2">
            <label className="block font-medium">Quantidade:</label>
            <input
              type="number"
              className="border rounded px-2 py-1 w-20"
              min={1}
              max={variation.sizes[0].stock}
              value={quantity}
              onChange={e => setQuantity(Math.max(1, Math.min(variation.sizes[0].stock, Number(e.target.value))))}
            />
            <span className="text-xs text-gray-500">Estoque: {variation.sizes[0].stock}</span>
          </div>

          {/* Botão adicionar ao carrinho */}
          <button
            className="flex items-center gap-2 bg-indigo-600 text-white justify-center px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-lg font-bold mt-2"
            onClick={handleAddToCart}
            disabled={variation.sizes[0].stock === 0}
          >
            <ShoppingCart size={20} /> Adicionar ao carrinho
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
