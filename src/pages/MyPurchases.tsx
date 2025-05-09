import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useGlobalContext } from "../context/globalContext";
import { getUserPurchasesReq } from "../requests/purchasesRequests";
import { logOut } from "../utils/logout";
import { useNavigate } from "react-router-dom";
import formatCurrencyInput from "../utils/formatRealCoin";
import PurchaseDetailsModal from "../components/purchaseDetailsModal";

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

  const fetchPurchases = async (page: number) => {
    if (!profileId || !token) {
      logOut(navigate);
      return;
    }

    try {
      const data = await getUserPurchasesReq(profileId, token, page, 3);

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
    return <div className="text-center py-12">Carregando suas compras...</div>;
  }

  if (purchases.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Você ainda não realizou nenhuma compra.
      </div>
    );
  }

  const handleClick = (purchase: PurchaseProps) => {
    if (!purchase) return;
    setSelectedPurchase(purchase);
    setOpenPurchaseDetails(true);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
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
                  {formatCurrencyInput(String(item.variantSizePrice))}
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
    </div>
  );
}
