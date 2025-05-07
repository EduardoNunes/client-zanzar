import { Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadSpinner from "../components/LoadSpinner";
import { useGlobalContext } from "../context/globalContext";
import {
  getCartProductsReq,
  orderBuyProductsReq,
} from "../requests/cartProductsRequests";
import formatCurrencyInput from "../utils/formatRealCoin";
import { logOut } from "../utils/logout";
import { toast } from "react-toastify";
import UserDataRegister from "../components/UserDataRegister";
import { getUserDataReq } from "../requests/profileRequests";

export default function MyCart() {
  const { token, profileId } = useGlobalContext();
  const [cartProducts, setCartProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [openUserDataRegister, setOpenUserDataRegister] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyCartProducts();
  }, []);

  const fetchMyCartProducts = async () => {
    try {
      if (!profileId || !token) return;
      const data = await getCartProductsReq(profileId, token);

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
    if (selectedItems.size >= 5 && !selectedItems.has(productId)) {
      toast.info("Você só pode selecionar até 5 itens.");
      return;
    }

    setSelectedItems((prev) => {
      const updated = new Set(prev);

      if (updated.has(productId)) {
        updated.delete(productId);
      } else {
        updated.add(productId);
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

    if (!profileId || !token) {
      logOut(navigate);
      return;
    }

    if (selectedItems.size === 0) {
      return;
    }

    if (selectedItems.size > 5) {
      toast.info(
        "Somente 5 produtos diferentes podem ser enviados em uma compra por vez."
      );
      setCheckoutLoading(false);
      return;
    }

    try {
      const userDataResponse = await getUserDataReq(profileId, token);

      if (
        !userDataResponse.fullName ||
        !userDataResponse.birthDate ||
        !userDataResponse.phoneNumber ||
        !userDataResponse.addressId ||
        !userDataResponse.address.city ||
        !userDataResponse.address.country ||
        !userDataResponse.address.neighborhood ||
        !userDataResponse.address.number ||
        !userDataResponse.address.postalCode ||
        !userDataResponse.address.state ||
        !userDataResponse.address.street
      ) {
        toast.info("Preencha os dados para prosseguir com a compra");

        setOpenUserDataRegister(true);
        setUserData(userDataResponse);
        return;
      }

      console.log("PASSOU");
      const selectedProducts = cartProducts
        .filter((item) => selectedItems.has(item.id))
        .map((item) => ({
          productVariantSizeId: item.productVariantSizeId,
          quantity: item.quantity,
          cartId: item.id,
        }));

      await orderBuyProductsReq(profileId, token, selectedProducts);

      setCartProducts((prev) =>
        prev.filter((item) => !selectedItems.has(item.id))
      );

      setSelectedItems(new Set());
    } catch (error) {
      console.error("Erro ao processar o checkout:", error);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return <LoadSpinner />;
  }

  return (
    <div className="flex justify-center items-center w-full h-full">
      {openUserDataRegister && (
        <div
          className="absolute top-0 left-0 flex justify-center items-center h-full w-full shadow-md rounded z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <UserDataRegister
            setOpenUserDataRegister={setOpenUserDataRegister}
            userDataResponse={userData}
          />
        </div>
      )}
      <div className="bg-white rounded-lg shadow-lg w-full h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Carrinho</h2>
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
                    disabled={cartProduct.stock === 0}
                  />
                  <img
                    src={cartProduct.images[0] || "/placeholder.png"}
                    alt={cartProduct.name}
                    className={`w-16 h-16 object-cover rounded-lg ${
                      cartProduct.stock === 0 ? "opacity-50" : ""
                    }`}
                  />
                  <div
                    className={`flex-1 ${
                      cartProduct.stock === 0 ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex flex-col">
                      <h3 className="font-semibold text-gray-800">
                        {cartProduct.name}
                      </h3>
                      <span className="text-sm text-gray-600">
                        {cartProduct.size}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-4">
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
                          disabled={cartProduct.stock === 0}
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
                          disabled={cartProduct.stock === 0}
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
                  <span
                    className={`absolute text-red-500 font-bold top-10 right-6 ${
                      cartProduct.stock === 0 ? "block" : "hidden"
                    }`}
                  >
                    ESGOTADO
                  </span>
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
