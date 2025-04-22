import { Loader2, Star } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalContext } from "../context/globalContext";
import { favoriteStoreReq } from "../requests/storeRequests";
import { logOut } from "../utils/logout";

interface FavoriteButtonProps {
  userStore: UserStore;
  isFavorited: boolean;
  setIsFavorited: React.Dispatch<React.SetStateAction<boolean>>;
  setTotalFavoriters: React.Dispatch<React.SetStateAction<number>>;
}

interface UserStore {
  userStoreId: string;
  id: string;
  name: string;
  bannerUrl: string | null;
  logoUrl: string | null;
  description: string | null;
  totalSales: number;
  totalProducts: number;
  totalFavoriters: number;
  isFavorited: boolean;
  isOwnStore: boolean;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  userStore,
  isFavorited,
  setIsFavorited,
  setTotalFavoriters,
}) => {
  const { token, profileId } = useGlobalContext();
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const navigate = useNavigate();

  const handleFavoriteToggle = async () => {
    if (!userStore || !profileId || !token) {
      console.error("UserStore, profileId or token not found");
      logOut(navigate);
      return;
    }

    setFavoriteLoading(true);

    try {
      await favoriteStoreReq(profileId, userStore.id, token);
      setIsFavorited(!isFavorited);
      setTotalFavoriters((prev: number) => prev + (isFavorited ? -1 : 1));
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  return (
    <button
      onClick={handleFavoriteToggle}
      disabled={favoriteLoading}
      className={`flex items-center justify-center w-full gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isFavorited ?
        "bg-gray-100 hover:bg-gray-200 text-gray-700"
        : "bg-indigo-600 hover:bg-indigo-700 text-white"
        }`}
    >
      {favoriteLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isFavorited ? (
        <>
          <Star className="w-5 h-5 text-yellow-500 fill-amber-500" />
          Loja favoritada
        </>
      ) : (
        <>
          <Star className="w-5 h-5" />
          Favoritar loja
        </>
      )}
    </button>
  );
};

export default FavoriteButton;
