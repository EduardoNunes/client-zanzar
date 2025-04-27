import { Camera } from "lucide-react";
import React from "react";
import FavoriteButton from "./FavoriteButton";

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

interface UserStoreHeaderProps {
  userStore: UserStore;
  isCurrentUser: boolean;
  isFavorited: boolean;
  setIsFavorited: React.Dispatch<React.SetStateAction<boolean>>;
  totalFavoriters: number;
  setTotalFavoriters: React.Dispatch<
    React.SetStateAction<number>
  >;
  uploadingLogo: boolean;
  handleLogoChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => Promise<void>;
  uploadingBanner: boolean;
  handleBannerChange: (
    event: React.ChangeEvent<HTMLInputElement>
  ) => Promise<void>;
}

export default function UserStoreHeader({
  userStore,
  isCurrentUser,
  isFavorited,
  setIsFavorited,
  totalFavoriters,
  setTotalFavoriters,
  uploadingLogo,
  handleLogoChange,
  uploadingBanner,
  handleBannerChange,
}: UserStoreHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative group w-full">
          <div className="flex justify-center items-center w-full aspect-video rounded-[8px] overflow-hidden bg-gray-200 relative">
            {userStore?.bannerUrl ? (
              <>
                <img
                  src={userStore?.bannerUrl}
                  alt={userStore?.name}
                  className="w-full h-full object-cover opacity-0"
                  onLoad={(e) => {
                    const img = e.currentTarget;
                    const spinner = img.nextElementSibling as HTMLDivElement;
                    img.classList.remove("opacity-0");
                    spinner.classList.add("hidden");
                  }}
                  onError={(e) => {
                    const img = e.currentTarget;
                    const spinner = img.nextElementSibling as HTMLDivElement;
                    img.classList.add("opacity-0");
                    spinner.classList.add("hidden");
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
                </div>
              </>
            ) : (
              <Camera />
            )}
          </div>
          {isCurrentUser && (
            <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <input
                type="file"
                accept="image/png, image/jpg, image/jpeg"
                onChange={handleBannerChange}
                className="hidden"
                disabled={uploadingBanner}
              />
              {uploadingBanner ? (
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
              ) : (
                <span className="text-white text-sm">Trocar</span>
              )}
            </label>
          )}
        </div>

        <div className="flex justify-between">
          <div className="flex flex-col pr-2">
            <div className="flex items-center w-full gap-2">
              <div className="flex justify-center items-center h-10 w-10 overflow-hidden bg-transparent relative">
                {userStore?.logoUrl ? (
                  <>
                    <img
                      src={userStore?.logoUrl}
                      alt={userStore?.name}
                      className="w-full h-full object-cover opacity-0"
                      onLoad={(e) => {
                        const img = e.currentTarget;
                        const spinner = img.nextElementSibling as HTMLDivElement;
                        img.classList.remove("opacity-0");
                        spinner.classList.add("hidden");
                      }}
                      onError={(e) => {
                        const img = e.currentTarget;
                        const spinner = img.nextElementSibling as HTMLDivElement;
                        img.classList.add("opacity-0");
                        spinner.classList.add("hidden");
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
                    </div>
                  </>
                ) : (
                  <Camera />
                )}
                {isCurrentUser && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <input
                      type="file"
                      accept="image/png, image/jpg, image/jpeg"
                      onChange={handleLogoChange}
                      className="hidden"
                      disabled={uploadingLogo}
                    />
                    {uploadingLogo ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
                    ) : (
                      <span className="text-white text-sm">Trocar</span>
                    )}
                  </label>
                )}
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {userStore?.name}
              </h1>
            </div>
            <h2 className="text-md text-gray-900 my-2">
              {userStore?.description}
            </h2>
          </div>
          <div className="flex flex-col justify-center md:justify-start space-x-6 text-gray-600">
            <div>
              <span className="font-bold text-gray-900 mr-1">
                {userStore?.totalProducts || 0}
              </span>
              {userStore?.totalProducts && userStore?.totalProducts > 1
                ? "Produtos"
                : "Produto"}
            </div>
            <div>
              <span className="font-bold text-gray-900 mr-1">
                {totalFavoriters}
              </span>
              {totalFavoriters > 1 ? "Favoritados" : "Favoritado"}
            </div>
            <div>
              <span className="font-bold text-gray-900 mr-1">
                {userStore?.totalSales || 0}
              </span>
              {userStore?.totalSales > 1 ? "Vendas" : "Venda"}
            </div>
          </div>
        </div>
        {!isCurrentUser && userStore && (
          <div>
            <FavoriteButton
              userStore={userStore}
              isFavorited={isFavorited}
              setIsFavorited={setIsFavorited}
              setTotalFavoriters={setTotalFavoriters}
            />
          </div>
        )}
      </div>
    </div>
  );
}
