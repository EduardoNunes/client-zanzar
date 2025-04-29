import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UserStoreGrid from "../components/UserStoreGrid";
import UserStoreHeader from "../components/UserStoreHeader";
import { useGlobalContext } from "../context/globalContext";
import {
  getUserStoreReq,
  updateBannerReq,
  updateLogoReq,
} from "../requests/storeRequests";
import { logOut } from "../utils/logout";
import { toast } from "react-toastify";
import LoadSpinner from "../components/KoadSpinner";

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
  productFeePercentage?: number;
}

export default function UserStore() {
  const { token, profileId, isLoadingToken } = useGlobalContext();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [userStore, setUserStore] = useState<UserStore | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [totalFavoriters, setTotalFavoriters] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (!isLoadingToken && !profileId && !token) {
      logOut(navigate);
    } else {
      fetchStoreAndPosts();
    }
  }, [isLoadingToken, profileId, navigate]);

  async function fetchStoreAndPosts() {
    try {
      setLoading(true);
      const userStoreData = slug && profileId && (await getUserStoreReq(slug, token, profileId));

      if (!userStoreData) return;

      userStoreData && setUserStore(userStoreData);
      setIsFavorited(userStoreData.isFavorited);

      const isCurrentUserProfile = profileId === userStoreData.profileId;
      setIsCurrentUser(isCurrentUserProfile);

      setTotalFavoriters(userStoreData.totalFavoriters);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleBannerChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!profileId || !token) {
      logOut(navigate);
      return;
    }
    const loadingBanner = toast.loading("Atualizando banner...");


    try {
      const file = event.target.files?.[0];
      if (!file) return;
      setUploadingBanner(true);

      await updateBannerReq(profileId, file, token, userStore?.id);
      await fetchStoreAndPosts();
    } catch (error) {
      console.error("Erro ao atualizar o banner:", error);
    } finally {
      setUploadingBanner(false);
      toast.dismiss(loadingBanner);
    }
  };

  const handleLogoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!profileId || !token) {
      logOut(navigate);
      return;
    }

    const loadingLogo = toast.loading("Atualizando logo...");

    try {
      const file = event.target.files?.[0];
      if (!file) return;
      setUploadingLogo(true);

      await updateLogoReq(profileId, file, token, userStore?.id);
      await fetchStoreAndPosts();
    } catch (error) {
      console.error("Erro ao atualizar o logo:", error);
    } finally {
      setUploadingLogo(false);
      toast.dismiss(loadingLogo);
    }
  };

  if (loading) { return <LoadSpinner /> }

  return (
    <>
      <div className="relative max-w-4xl mx-auto">
        {userStore && (
          <UserStoreHeader
            userStore={userStore}
            isCurrentUser={isCurrentUser}
            isFavorited={isFavorited}
            setIsFavorited={setIsFavorited}
            totalFavoriters={totalFavoriters}
            setTotalFavoriters={setTotalFavoriters}
            uploadingLogo={uploadingLogo}
            handleLogoChange={handleLogoChange}
            uploadingBanner={uploadingBanner}
            handleBannerChange={handleBannerChange}
          />
        )
        }
        <UserStoreGrid
          productFeePercentage={userStore?.productFeePercentage}
          userStoreId={userStore?.id}
          onProductAdded={() => {
            setUserStore(prev => prev ? { ...prev, totalProducts: (prev.totalProducts || 0) + 1 } : prev);
          }}
        />
      </div>
    </>
  );
}
