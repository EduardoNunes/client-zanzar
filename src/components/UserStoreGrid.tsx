import { PackagePlus, ClipboardList } from "lucide-react";
import { useEffect, useState } from "react";
import { useGlobalContext } from "../context/globalContext";
import { loadProductsReq } from "../requests/productRequests";
import AddProduct from "./AddProduct";
import ProductCard from "./ProductCard";
import { ProductVariationsProps } from "../types/ProductVariant";
import LoadSpinner from "./LoadSpinner";
import { useNavigate } from "react-router-dom";

interface UserStoreGridProps {
  productFeePercentage?: number;
  userStoreId?: string;
}

interface ProductCardProps {
  description: string;
  id: string;
  name: string;
  productSubCategory: SubCategoryProps;
  rating: number;
  ratingCount: number;
  totalSold: number;
  variations: ProductVariationsProps[];
  avaliableQuantity?: number;
  onCartClick: () => void;
}

interface SubCategoryProps {
  category: CategoryProps;
  id: string;
  name: string;
}

interface CategoryProps {
  id: string;
  name: string;
}

interface UserStoreGridProps {
  productFeePercentage?: number;
  userStoreId?: string;
  userStoreSlug?: string;
  isCurrentUser?: boolean;
  onProductAdded?: () => void;
}

export default function UserStoreGrid({
  productFeePercentage,
  userStoreId,
  userStoreSlug,
  isCurrentUser,
  onProductAdded,
}: UserStoreGridProps) {
  const { profileId, token, isOpen, setIsOpen } = useGlobalContext();
  const [selectedProduct, setSelectedProduct] =
    useState<ProductCardProps | null>(null);
  const [allProducts, setAllProducts] = useState<ProductCardProps[]>([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  let scrollTriggered = false;

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollTriggered) {
        scrollTriggered = true;
        return;
      }

      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.scrollHeight - 10
      ) {
        loadMoreProducts();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadingMore]);

  const fetchProducts = async () => {
    setLoading(true);

    if (userStoreId && profileId) {
      const initialProducts = await loadProductsReq(
        userStoreId,
        1,
        token,
        profileId
      );

      setAllProducts(initialProducts);
    }
    setLoading(false);
  };

  const loadMoreProducts = async () => {
    if (loadingMore) return;

    setLoadingMore(true);
    try {
      if (userStoreId && profileId) {
        const nextPage = page + 1;
        const newProducts = await loadProductsReq(
          userStoreId,
          nextPage,
          token,
          profileId
        );

        if (newProducts && newProducts.length > 0) {
          setAllProducts((prev) => [...prev, ...newProducts]);
          setPage(nextPage);
        }
      }
    } catch (error) {
      console.error("Error loading more Products:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleAddProduct = () => {
    setIsOpen(true);
  };

  const handleOpenOrders = () => {
    if (userStoreSlug) {
      navigate(`/user-store/${userStoreSlug}/orders`);
    }
  };

  if (loading) {
    return <LoadSpinner />;
  }

  return (
    <div>
      {isOpen && (
        <AddProduct
          productFeePercentage={productFeePercentage}
          userStoreId={userStoreId}
          onProductAdded={async () => {
            await fetchProducts();
            if (typeof onProductAdded === "function") onProductAdded();
          }}
        />
      )}
      <div
        className={`flex items-center justify-center gap-4 ${
          isCurrentUser ? "block" : "hidden"
        }`}
      >
        <button className="w-9 h-9 my-4" onClick={handleAddProduct}>
          <PackagePlus className="w-full h-full text-gray-600" />
        </button>
        <button className="w-9 h-9 my-4" onClick={handleOpenOrders}>
          <ClipboardList className="w-full h-full text-gray-600" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        {allProducts.length > 0 ? (
          allProducts
            .filter(
              (product) =>
                product.avaliableQuantity && product.avaliableQuantity > 0
            )
            .map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                productSubCategory={product.productSubCategory}
                rating={product.rating}
                ratingCount={product.ratingCount ?? 0}
                totalSold={product.totalSold ?? 0}
                variations={product.variations ?? []}
                onCartClick={() => setSelectedProduct(product)}
              />
            ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            Nenhum produto ainda
          </div>
        )}
      </div>

      {loadingMore && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {!loadingMore && allProducts.length > 0 && (
        <div className="text-center text-gray-500 py-4">Sem mais produtos.</div>
      )}
      <div
        className={`md:hidden transition-all duration-100 ease-in-out ${
          selectedProduct
            ? "max-h-screen opacity-100 visible"
            : "max-h-0 opacity-0 invisible"
        }`}
      ></div>
    </div>
  );
}
