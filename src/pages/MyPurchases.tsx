import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useGlobalContext } from "../context/globalContext";
import {
  getUserPurchasesReq,
  productEvaluationReq,
} from "../requests/purchasesRequests";
import { logOut } from "../utils/logout";
import { useNavigate } from "react-router-dom";
import formatCurrencyInput from "../utils/formatRealCoin";
import PurchaseDetailsModal from "../components/purchaseDetailsModal";
import ProductEvaluationModal from "../components/ProductEvaluationModal";
import RatingStars from "../components/RatingStars";

interface PurchaseProps {
  orderId: string;
  orderDate: string;
  total: number;
  items: {
    variantColorCode: string;
    variantColorName: string;
    images: ImagesProps[];
    productName: string;
    orderItemId: string;
    price: number;
    priceAtPurchase: number;
    productId: string;
    quantity: number;
    variantSizePrice: number;
    status: string;
    storeId: string;
    storeName: string;
    storeSlug: string;
    variantId: string;
    variantSizeId: string;
    variantSize: string;
    productReview: {
      rating: number;
      comment: string;
    }[];
  }[];
}

interface ImagesProps {
  position: number;
  url: string;
}

export default function MyPurchases() {
  const { profileId, token } = useGlobalContext();
  const [purchases, setPurchases] = useState<PurchaseProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [openPurchaseDetails, setOpenPurchaseDetails] = useState(false);
  const [selectedPurchase, setSelectedPurchase] =
    useState<PurchaseProps | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const [isProductEvaluationModalOpen, setIsProductEvaluationModalOpen] =
    useState(false);
  const [selectedItemForEvaluation, setSelectedItemForEvaluation] = useState<
    any | null
  >(null);

  const fetchPurchases = async (page: number) => {
    if (!profileId || !token) {
      logOut(navigate);
      return;
    }
    try {
      const data = await getUserPurchasesReq(profileId, token, page, 3);
      console.log("DATA", data);
      setPurchases((prev) => {
        const newPurchases: PurchaseProps[] = data.filter(
          (newPurchase: PurchaseProps) =>
            !prev.some(
              (existingPurchase: PurchaseProps) =>
                existingPurchase.orderId === newPurchase.orderId
            )
        );
        return [...prev, ...newPurchases];
      });

      if (data.length < 3) setHasMore(false);
    } catch (error) {
      console.error("Erro ao buscar compras:", error);
      toast.error("Erro ao carregar suas compras.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases(page);
  }, [page]);

  if (loading && purchases.length === 0) {
    return (
      <div className="text-center py-12 h-full">Carregando suas compras...</div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 h-full">
        Você ainda não realizou nenhuma compra.
      </div>
    );
  }

  const handleClick = (purchase: PurchaseProps) => {
    if (!purchase) return;
    setSelectedPurchase(purchase);
    setOpenPurchaseDetails(true);
  };

  const handleOpenEvaluationModal = (item: any) => {
    setSelectedItemForEvaluation(item);
    setIsProductEvaluationModalOpen(true);
  };

  const handleCloseEvaluationModal = () => {
    setIsProductEvaluationModalOpen(false);
    setSelectedItemForEvaluation(null);
  };

  const handleSubmitEvaluation = async (
    productRating: number,
    productComment: string
  ) => {
    if (selectedItemForEvaluation) {
      if (!profileId || !token) {
        logOut(navigate);
        return;
      }

      setLoading(true);
      console.log(productRating, productComment);

      try {
        const data = await productEvaluationReq(
          profileId,
          token,
          selectedItemForEvaluation.orderItemId,
          productRating,
          productComment
        );

        console.log("DATA", data);

        // Update the purchases state
        setPurchases((prevPurchases) => {
          return prevPurchases.map((purchase) => {
            return {
              ...purchase,
              items: purchase.items.map((item) => {
                if (
                  item.orderItemId === selectedItemForEvaluation.orderItemId
                ) {
                  return {
                    ...item,
                    productReview: [
                      { rating: productRating, comment: productComment },
                    ],
                  };
                }
                return item;
              }),
            };
          });
        });

        toast.success("Avaliação enviada com sucesso!");
        handleCloseEvaluationModal();
      } catch (error: any) {
        console.error("Erro ao avaliar:", error);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const statusText = {
    PENDENTE: "Aguardando pagamento",
    PAGO: "Aguardando envio",
    ENVIADO: "O produto está a caminho",
    RECEBIDO: "Compra finalizada",
    CANCELADO: "Cancelado",
  };

  return (
    <div className="p-4 max-w-4xl mx-auto h-full">
      <h1 className="text-2xl font-bold mb-6">Minhas Compras</h1>
      <div className="space-y-4">
        {purchases.map((purchase) => (
          <div
            key={purchase.orderId}
            className="border rounded-lg p-4 shadow-sm bg-white"
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">
                Compra #{purchase.orderId.slice(0, 8)}
              </h2>
              <button
                className="text-blue-500 underline"
                onClick={() => {
                  handleClick(purchase);
                }}
              >
                Ver detalhes
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Data: {new Date(purchase.orderDate).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">
              Total: {formatCurrencyInput(String(purchase.total))}
            </p>

            <ul className="mt-2 space-y-1">
              {purchase.items.map((item, index) => (
                <li key={index} className="text-sm mb-2">
                  <p>
                    {item.productName} - {item.variantSize} -{" "}
                    {item.variantColorName}
                  </p>
                  {item.quantity} unidade(s) -{" "}
                  {formatCurrencyInput(String(item.priceAtPurchase))}
                  <p className="mb-2">
                    <strong>Status:</strong>{" "}
                    <strong
                      className={`${
                        item.status === "PAGO"
                          ? "text-green-500"
                          : item.status === "PENDENTE"
                          ? "text-yellow-400"
                          : item.status === "ENVIADO"
                          ? "text-orange-400"
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
                  <div>
                    {item.productReview && item.productReview.length >= 1 ? (
                      <div className="flex">
                        <p className="mr-1">Minha avaliação:</p>
                        <RatingStars rating={item.productReview[0].rating} />
                      </div>
                    ) : (
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                        onClick={() => handleOpenEvaluationModal(item)}
                      >
                        Avaliar Produto
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Carregar mais
          </button>
        </div>
      )}
      {selectedPurchase && (
        <PurchaseDetailsModal
          isOpen={openPurchaseDetails}
          onClose={() => setOpenPurchaseDetails(false)}
          purchase={selectedPurchase}
        />
      )}
      {selectedItemForEvaluation && (
        <ProductEvaluationModal
          isOpen={isProductEvaluationModalOpen}
          onClose={handleCloseEvaluationModal}
          onSubmit={handleSubmitEvaluation}
          item={selectedItemForEvaluation}
        />
      )}
    </div>
  );
}
