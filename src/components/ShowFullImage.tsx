import { X } from "lucide-react";
import { useState } from "react";

interface ShowFullImageProps {
  images: { url: string }[];
  selectedImageIndex: number;
  setSelectedImageIndex: (index: number) => void;
  product: { name: string };
  onClose: () => void;
  handleImageSelect: (index: number) => void;
}

export default function ShowFullImage({
  images,
  selectedImageIndex,
  setSelectedImageIndex,
  product,
  onClose,
  handleImageSelect,
}: ShowFullImageProps) {
  const [showFullImage, setShowFullImage] = useState(false);

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-full flex justify-center mb-4"
        style={{ aspectRatio: "16/9", maxHeight: "35vh" }}
      >
        <img
          src={images[selectedImageIndex]?.url || "/placeholder.png"}
          alt={product.name}
          className="object-contain w-full h-full rounded-lg"
          style={{ aspectRatio: "16/9", maxHeight: "35vh" }}
          onClick={() => setShowFullImage(true)}
        />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1"
        >
          <X size={24} />
        </button>
        {showFullImage && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black/90"
            onClick={() => setShowFullImage(false)}
          >
            <button
              className="absolute left-4 bg-black/80 text-white rounded-full p-2 hover:bg-black"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex(
                  (selectedImageIndex - 1 + images.length) % images.length
                );
              }}
            >
              {"<"}
            </button>
            <img
              src={images[selectedImageIndex]?.url || "/placeholder.png"}
              alt={product.name}
              className="max-w-full max-h-full rounded-lg shadow-2xl border-4 border-white"
              style={{ objectFit: "contain" }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute right-4 bg-black/80 text-white rounded-full p-2 hover:bg-black"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex((selectedImageIndex + 1) % images.length);
              }}
            >
              {">"}
            </button>
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute top-4 right-4 bg-black/80 text-white rounded-full p-2 hover:bg-black"
            >
              <X size={32} />
            </button>
          </div>
        )}
      </div>

      {/* Miniaturas */}
      <div className="flex gap-2 mt-2">
        {images.map((img, idx) => (
          <img
            key={idx}
            src={img.url}
            alt={product.name}
            className={`w-16 h-16 object-cover rounded-lg border-2 ${
              selectedImageIndex === idx
                ? "border-indigo-600"
                : "border-transparent"
            }`}
            onClick={() => handleImageSelect(idx)}
            style={{ cursor: "pointer" }}
          />
        ))}
      </div>
    </div>
  );
}
