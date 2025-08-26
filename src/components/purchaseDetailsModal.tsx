import { useNavigate } from "react-router-dom";
import formatCurrencyInput from "../utils/formatRealCoin";

interface PurchaseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: {
    orderId: string;
    orderDate: string;
    total: number;
    items: {
      orderItemId: string;
      productId: string;
      productName: string;
      quantity: number;
      priceAtPurchase: number;
      status: string;
      storeId: string;
      storeName: string;
      storeSlug: string;
      variantColorCode: string;
      variantColorName: string;
      variantSize: string;
      variantSizeId: string;
      variantSizePrice: number;
      images: {
        url: string;
        position: number;
      }[];
    }[];
  };
}

export default function PurchaseDetailsModal({
  isOpen,
  onClose,
  purchase,
}: PurchaseDetailsModalProps) {
  const navigate = useNavigate();
  if (!isOpen) return null;

  const statusText = {
    PENDENTE: "Aguardando pagamento",
    PAGO: "Aguardando envio",
    ENVIADO: "O produto está a caminho",
    RECEBIDO: "Compra finalizada",
    CANCELADO: "Cancelado",
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-3"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="bg-white rounded-lg shadow-lg w-[90%] h-[85%] max-w-3xl p-6 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Detalhes da Compra</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 font-bold"
          >
            ✕
          </button>
        </div>
        <div className="mb-4">
          <p>
            <strong>ID do Pedido: #</strong>
            {purchase.orderId.slice(0, 8)}
          </p>
          <p>
            <strong>Data do Pedido:</strong>{" "}
            {new Date(purchase.orderDate).toLocaleDateString()}
          </p>
          <p>
            <strong>Total pago:</strong>{" "}
            {formatCurrencyInput(String(purchase.total))}
          </p>
        </div>
        <div className="space-y-4">
          {purchase.items.map((item) => (
            <div
              key={item.orderItemId}
              className="border rounded-lg p-4 shadow-sm bg-gray-50"
            >
              <h3 className="text-lg mb-2">
                <strong>Produto:</strong> {item.productName}
              </h3>
              <p className="mb-2">
                <strong>Status:</strong>{" "}
                <strong
                  className={`${
                    item.status === "PAGO"
                      ? "text-green-500"
                      : item.status === "PENDENTE"
                      ? "text-yellow-400"
                      : item.status === "ENVIADO"
                      ? "text-yellow-400"
                      : item.status === "CANCELADO"
                      ? "text-red-600"
                      : item.status === "RECEBIDO"
                      ? "text-blue-600"
                      : "text-gray-200"
                  }`}
                >
                  {item.status}
                </strong>{" "}
                - {statusText[item.status as keyof typeof statusText]}
              </p>
              <div className="flex">
                <p className="w-1/2">
                  <strong>Quantidade:</strong> {item.quantity}
                </p>
                <p className="w-1/2">
                  <strong>Preço:</strong>{" "}
                  {formatCurrencyInput(
                    String(item.priceAtPurchase * item.quantity)
                  )}
                </p>
              </div>
              <div className="flex mb-2">
                <p className="flex items-center w-1/2">
                  <strong className="mr-1">Cor:</strong> {item.variantColorName}{" "}
                  <span
                    className="inline-block w-4 h-4 rounded-full ml-1"
                    style={{ backgroundColor: item.variantColorCode }}
                  ></span>
                </p>
                <p className="w-1/2">
                  <strong>Tamanho:</strong> {item.variantSize}
                </p>
              </div>

              <p className="mb-4">
                <strong>Loja:</strong>{" "}
                <button
                  onClick={() => navigate(`/user-store/${item.storeSlug}`)}
                  className="text-blue-500 underline"
                >
                  {item.storeName}
                </button>
              </p>

              <div className="flex gap-2 mt-2">
                {item.images.map((image) => (
                  <img
                    key={image.position}
                    src={image.url}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
