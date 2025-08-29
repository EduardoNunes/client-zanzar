import { useState } from "react";

interface ProductEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => void;
  item: any;
}

export default function ProductEvaluationModal({
  isOpen,
  onClose,
  onSubmit,
  item,
}: ProductEvaluationModalProps) {
  const [productRating, setProductRating] = useState(0);
  const [productComment, setProductComment] = useState("");

  const handleSubmit = () => {
    onSubmit(productRating, productComment);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600/50 overflow-y-auto h-full w-full flex items-center justify-center z-3">
      <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white flex flex-col">
        {/* Product Evaluation */}
        <div className="flex flex-col items-center mb-4">
          <h2 className="text-lg font-bold mb-4">Avalie o Produto</h2>
          <h3 className="text-center text-lg font-semibold mb-2">
            {item.productName} - {item.variantColorName} - {item.variantSize}
          </h3>

          <div className="mb-4">
            <div className="flex justify-center mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setProductRating(star)}
                  className="text-yellow-500 hover:text-yellow-700 focus:outline-none"
                >
                  <svg
                    className="w-8 h-8"
                    fill={star <= productRating ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4 w-full">
            <label
              htmlFor="productComment"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Comentário sobre o produto:
            </label>
            <textarea
              id="productComment"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows={3}
              value={productComment}
              onChange={(e) => setProductComment(e.target.value)}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-4">
          <button
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={handleSubmit}
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
