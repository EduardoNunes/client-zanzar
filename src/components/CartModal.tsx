import { Loader2, Minus, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useGlobalContext } from "../context/globalContext";
import { getCartProductsReq } from "../requests/cartProductsRequests";
import LoadSpinner from "./LoadSpinner";
import formatCurrencyInput from "../utils/formatRealCoin";

interface CartModalProps {
  setIsOpenCart: (isOpen: boolean) => void;
}

export default function CartModal({ setIsOpenCart }: CartModalProps) {
  const { token, profileId } = useGlobalContext();
  const [cartProducts, setCartProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set()); // Estado para itens selecionados

  useEffect(() => {
    fetchMyCartProducts();
  }, []);

  const fetchMyCartProducts = async () => {
    try {
      if (!profileId || !token) return;
      const data = await getCartProductsReq(profileId, token);
      console.log("Dados do carrinho:", data);
      setCartProducts(data);
    } catch (error) {
      console.error("Erro ao buscar produtos do carrinho:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = (productId: string) => {
    setCartProducts((prev) => prev.filter((item) => item.id !== productId));
    setSelectedItems((prev) => {
      const updated = new Set(prev);
      updated.delete(productId); // Remove o item dos selecionados
      return updated;
    });
  };

  const updateQuantity = (
    productId: string,
    newQuantity: number,
    stock: number
  ) => {
    if (newQuantity < 1) {
      return;
    }

    if (newQuantity > stock) {
      newQuantity = stock; // Limita a quantidade ao estoque disponível
    }

    setCartProducts((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const toggleSelectItem = (productId: string) => {
    setSelectedItems((prev) => {
      const updated = new Set(prev);
      if (updated.has(productId)) {
        updated.delete(productId); // Desmarca o item
      } else {
        updated.add(productId); // Marca o item
      }
      return updated;
    });
  };

  const getSelectedTotal = () => {
    return formatCurrencyInput(
      String(
        cartProducts.reduce((total, item) => {
          if (selectedItems.has(item.id)) {
            return total + item.price * item.quantity;
          }
          return total;
        }, 0)
      )
    );
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    // Simulate checkout process
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setCartProducts([]);
    setSelectedItems(new Set());
    setCheckoutLoading(false);
  };

  if (loading) {
    return <LoadSpinner />;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center w-full h-full"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="bg-white rounded-lg shadow-lg w-[90%] h-[90%] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Carrinho</h2>
          <button
            onClick={() => setIsOpenCart(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto p-4">
          {cartProducts && cartProducts.length > 0 ? (
            <div className="space-y-4">
              {cartProducts.map((cartProduct) => (
                <div
                  key={cartProduct.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow-sm relative"
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.has(cartProduct.id)}
                    onChange={() => toggleSelectItem(cartProduct.id)}
                    className="w-5 h-5"
                  />
                  <img
                    src={cartProduct.images[0] || "/placeholder.png"}
                    alt={cartProduct.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">
                      {cartProduct.name}
                    </h3>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(
                              cartProduct.id,
                              cartProduct.quantity - 1,
                              cartProduct.stock
                            )
                          }
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center">
                          {cartProduct.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              cartProduct.id,
                              cartProduct.quantity + 1,
                              cartProduct.stock
                            )
                          }
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-indigo-600 font-semibold">
                        {formatCurrencyInput(
                          String(cartProduct.price * cartProduct.quantity)
                        )}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(cartProduct.id)}
                    className="p-2 hover:bg-gray-200 rounded absolute top-2 right-2"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Seu carrinho está vazio
            </div>
          )}
        </div>

        {/* Footer */}
        {cartProducts.length > 0 && (
          <div className="p-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total Selecionado</span>
              <span className="text-xl font-bold text-indigo-600">
                {getSelectedTotal()}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading || selectedItems.size === 0}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkoutLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processando...</span>
                </div>
              ) : (
                "Finalizar Compra"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
