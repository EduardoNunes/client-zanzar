import { ShoppingCart } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useGlobalContext } from "../context/globalContext";
import { addToCartReq } from "../requests/cartProductsRequests";
import { ProductProps } from "../types/ProductVariant";
import formatCurrencyWithSmallCents from "../utils/centsReduct";
import { logOut } from "../utils/logout";
import RatingStars from "./RatingStars";
import ShowFullImage from "./ShowFullImage";

const ProductModal: React.FC<ProductProps> = ({ product, onClose }) => {
  const { profileId, token } = useGlobalContext();
  const [selectedVariationIndex, setSelectedVariationIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const variation = product.variations[selectedVariationIndex];
  const images = variation.images;
  const [selectedSizeId, setSelectedSizeId] = useState(
    variation.sizes && variation.sizes.length > 0 ? variation.sizes[0].id : ""
  );
  const [sizeToCart, setSizeToCart] = useState("");

  const navigate = useNavigate();

  const handleColorSelect = (index: number) => {
    setSelectedVariationIndex(index);
    setSelectedImageIndex(0);
    setSelectedSizeId(product.variations[index].sizes[0]?.id || "");
  };

  const handleSizeSelect = (sizeName: string, sizeId: string) => {
    setSizeToCart(sizeId);
    setSelectedSizeId(sizeName);
  };

  const handleImageSelect = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleAddToCart = () => {
    if (!sizeToCart) {
      toast.info("Selecione um tamanho.");
      return;
    }

    if (!profileId) {
      logOut(navigate);
      return;
    }

    addToCartReq(
      profileId,
      product.id,
      variation.id,
      sizeToCart,
      quantity,
      token
    ).then(() => {
      setQuantity(1);
    });
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 w-full h-full z-3 flex items-center justify-center bg-black bg-opacity-80"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white w-full h-full overflow-y-auto p-6 flex flex-col md:flex-row"
      >
        {/* Imagens/Carrossel */}
        <ShowFullImage
          images={images}
          selectedImageIndex={selectedImageIndex}
          setSelectedImageIndex={setSelectedImageIndex}
          product={product}
          onClose={onClose}
          handleImageSelect={handleImageSelect}
        />

        {/* Detalhes do produto */}
        <div className="flex-1 flex flex-col gap-3 mt-4">
          <div className="flex justify-between">
            <div className="flex flex-col pr-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {product.name}
              </h2>
              <div className="">
                <p className="text-gray-700 text-sm whitespace-pre-line">
                  {product.description}
                </p>
              </div>
              <div className="text-xl font-bold text-indigo-700 mt-2">
                {formatCurrencyWithSmallCents(
                  String(
                    variation.sizes.find((s) => s.size === selectedSizeId)
                      ?.price ?? variation.sizes[0].price
                  )
                )}
              </div>
            </div>
            <div
              className={`flex flex-col mt-2 items-center ${
                product.rating === 0 ? "hidden" : ""
              }`}
            >
              <div className="flex items-center">
                <RatingStars
                  rating={product.ratingCount / (product.rating || 1)}
                />
                <span className="ml-2 text-gray-500 text-sm">
                  ({product.ratingCount})
                </span>
              </div>
              <div className="text-gray-600 text-xs mt-2">
                Total vendidos:{" "}
                <span className="font-bold">{product.totalSold}</span>
              </div>
            </div>
          </div>

          {/* Seleção de cor */}
          {product.variations.length > 1 && (
            <div className="mb-2">
              <label className="block font-medium mb-1">
                Cor: {variation.colorName}
              </label>
              <div className="flex gap-2">
                {product.variations.map((v, idx) => (
                  <button
                    key={idx}
                    className={`w-8 h-8 rounded-full border-2 ${
                      selectedVariationIndex === idx
                        ? "border-indigo-600"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: v.colorCode || "#fff" }}
                    onClick={() => handleColorSelect(idx)}
                  >
                    {selectedVariationIndex === idx && (
                      <span className="block w-full h-full rounded-full border-2 border-indigo-600"></span>
                    )}
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
                  <label
                    key={size.id}
                    className={`flex items-center cursor-pointer px-2 py-1 border rounded border-gray-300}`}
                  >
                    <input
                      type="radio"
                      name="product-size"
                      value={size.id}
                      checked={selectedSizeId === size.size}
                      onChange={() => handleSizeSelect(size.size, size.id)}
                      className="mr-2"
                    />
                    <span>{size.size}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Seleção de quantidade */}
          <div className="mb-2 flex flex-col items-center justify-center">
            {variation.sizes.find((s) => s.size === selectedSizeId)?.stock ===
            0 ? (
              <div className="flex flex-col text-center text-red-500">
                <span className="text-sm font-semibold">ESGOTADO</span>
              </div>
            ) : (
              <div
                className={`flex flex-col text-center text-red-500 ${
                  (variation.sizes.find((s) => s.size === selectedSizeId)
                    ?.stock ?? 99) < 10
                    ? "block"
                    : "hidden"
                }`}
              >
                <span className="text-sm font-semibold">ÚLTIMAS UNIDADES</span>
                <span className="text-xs">
                  Restam apenas{" "}
                  {variation.sizes.find((s) => s.size === selectedSizeId)
                    ?.stock ?? variation.sizes[0].stock}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 mb-2">
              <label className="block font-medium">Quantidade:</label>
              <span className="flex flex-col items-center text-xs text-gray-500">
                Estoque:{" "}
                {variation.sizes.find((s) => s.size === selectedSizeId)
                  ?.stock ?? variation.sizes[0].stock}
              </span>
            </div>

            <div
              className={`flex items-center gap-2 ${
                variation.sizes.find((s) => s.size === selectedSizeId)
                  ?.stock === 0 && "opacity-50"
              }`}
            >
              <button
                type="button"
                className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200 text-lg font-bold"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={
                  quantity <= 1 ||
                  variation.sizes.find((s) => s.size === selectedSizeId)
                    ?.stock === 0
                }
              >
                -
              </button>
              <input
                type="number"
                className="border rounded px-2 py-1 w-20 text-center"
                min={1}
                max={
                  variation.sizes.find((s) => s.size === selectedSizeId)
                    ?.stock ?? variation.sizes[0].stock
                }
                value={quantity === 0 ? "" : quantity}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "") {
                    setQuantity(0);
                  } else {
                    const maxStock =
                      variation.sizes.find((s) => s.size === selectedSizeId)
                        ?.stock ?? variation.sizes[0].stock;
                    setQuantity(Math.max(0, Math.min(maxStock, Number(val))));
                  }
                }}
                onBlur={(e) => {
                  if (!e.target.value || Number(e.target.value) < 1) {
                    setQuantity(1);
                  }
                }}
                disabled={
                  variation.sizes.find((s) => s.size === selectedSizeId)
                    ?.stock === 0
                }
                style={{ MozAppearance: "textfield" }}
              />
              <button
                type="button"
                className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200 text-lg font-bold"
                onClick={() => {
                  const maxStock =
                    variation.sizes.find((s) => s.size === selectedSizeId)
                      ?.stock ?? variation.sizes[0].stock;
                  setQuantity((q) => Math.min(maxStock, q + 1));
                }}
                disabled={
                  quantity >=
                    (variation.sizes.find((s) => s.size === selectedSizeId)
                      ?.stock ?? variation.sizes[0].stock) ||
                  variation.sizes.find((s) => s.size === selectedSizeId)
                    ?.stock === 0
                }
              >
                +
              </button>
            </div>
            <span className="text-indigo-700 font-semibold text-lg mt-1">
              Total:{" "}
              {formatCurrencyWithSmallCents(
                String(
                  (variation.sizes.find((s) => s.size === selectedSizeId)
                    ?.price ?? variation.sizes[0].price) * quantity
                )
              )}
            </span>
          </div>

          {/* Botão adicionar ao carrinho */}
          <button
            className={`flex items-center gap-2 justify-center px-4 py-2 rounded-lg transition-colors text-lg font-bold mt-2 ${
              variation.sizes.find((s) => s.size === selectedSizeId)?.stock ===
              0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
            onClick={handleAddToCart}
            disabled={
              variation.sizes.find((s) => s.size === selectedSizeId)?.stock ===
              0
            }
          >
            <ShoppingCart size={20} /> Adicionar ao carrinho
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
