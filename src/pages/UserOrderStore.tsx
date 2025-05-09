import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useGlobalContext } from "../context/globalContext";
import { getStoreOrders, updateOrderStatus } from "../requests/storeRequests";
import { useNavigate, useParams } from "react-router-dom";
import formatCurrencyInput from "../utils/formatRealCoin";

interface Order {
  orderId: string;
  orderItem: string;
  customer: Customer;
  quantity: number;
  product: Product;
  priceAtPurchase: number;
  priceAtPurchaseBase: number;
  status: string;
  variant: Variant;
}

interface Customer {
  username: string;
  email: string;
  profileId: string;
}

interface Product {
  name: string;
}

interface Variant {
  id: string;
  size: string;
  basePrice: number;
  colorName: string;
}

const PAGE_LIMIT = 5;

export default function UserOrderStore() {
  const { token, profileId } = useGlobalContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const fetchOrders = async (currentPage: number) => {
    try {
      if (!profileId || !token || !slug) return;
      const data = await getStoreOrders(
        profileId,
        token,
        slug,
        currentPage,
        PAGE_LIMIT
      );

      if (data.length < PAGE_LIMIT) {
        setHasMore(false);
      }

      setOrders((prev) => {
        const combined = [...prev, ...data];
        const uniqueOrders = combined.filter(
          (order, index, self) =>
            index ===
            self.findIndex(
              (o) =>
                o.orderId === order.orderId && o.variant.id === order.variant.id
            )
        );
        return uniqueOrders;
      });
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
      toast.error("Erro ao carregar pedidos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const handleLoadMore = () => {
    if (hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  const handleStatusChange = async (orderItem: string, newStatus: string) => {
    try {
      if (!token) return;

      await updateOrderStatus(orderItem, newStatus, token);
      setOrders((prev) =>
        prev.map((order) =>
          order.orderItem === orderItem
            ? { ...order, status: newStatus }
            : order
        )
      );
      toast.success("Status do pedido atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar status do pedido:", error);
      toast.error("Erro ao atualizar status do pedido.");
    }
  };

  if (loading && orders.length === 0) {
    return <div>Carregando pedidos...</div>;
  }

  const statusText = {
    PAGO: "Aguardando envio",
    ENVIADO: "Aguardado recebimento",
    RECEBIDO: "Compra finalizada",
    CANCELADO: "Cancelado",
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Pedidos Recebidos</h1>
      {orders.length === 0 ? (
        <div className="text-gray-500">Nenhum pedido recebido.</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.orderId + order.variant.id}
              className="p-4 border rounded-lg shadow-sm bg-white"
            >
              <h2 className="text-lg font-semibold">
                Pedido #{order.orderId.slice(0, 8)}
              </h2>
              <button
                className="text-sm text-gray-600"
                onClick={() => {
                  navigate(`/profile/${order.customer.username}`);
                }}
              >
                <span className="font-semibold">Cliente:</span>{" "}
                <span className=" text-blue-500 underline">
                  {order.customer.username}
                </span>
              </button>
              <p className="text-sm text-gray-600">
                Email: {order.customer.email}
              </p>
              <ul className="mt-2 space-y-1">
                {order.product.name} - {order.variant.colorName} -{" "}
                {order.variant.size} - {order.quantity} unidade(s)
              </ul>
              <p className="mt-2 font-semibold">
                Total pago: {formatCurrencyInput(String(order.priceAtPurchase))}
              </p>
              <p className="mt-2 font-semibold">
                Total a receber:{" "}
                {formatCurrencyInput(
                  String(order.priceAtPurchaseBase)
                )}
              </p>
              <div className="flex mt-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Status do Pedido:
                  </label>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.orderItem, e.target.value)
                    }
                    className={`border border-black font-bold rounded px-2 py-1 ${
                      order.status === "PAGO"
                        ? "text-yellow-400"
                        : order.status === "ENVIADO"
                        ? "text-green-500"
                        : order.status === "CANCELADO"
                        ? "text-red-600"
                        : "text-gray-200"
                    }`}
                  >
                    <option value="PAGO">Pago</option>
                    <option value="ENVIADO">Enviado</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                  <p className="text-sm mt-1 text-gray-600">
                    {statusText[order.status as keyof typeof statusText]}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {hasMore && (
            <button
              onClick={handleLoadMore}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Carregar mais
            </button>
          )}
        </div>
      )}
    </div>
  );
}
