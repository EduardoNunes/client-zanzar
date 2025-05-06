import React, { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useGlobalContext } from "../context/globalContext";
import { getStoreBySlug } from "../requests/storeRequests";

export default function StoreOwnerRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { slug } = useParams();
  const { profileId, token } = useGlobalContext();
  const [isOwner, setIsOwner] = useState<boolean | null>(null);

  useEffect(() => {
    async function verifyOwner() {
      if (!slug || !profileId) {
        setIsOwner(false);
        return;
      }

      try {
        if (!token) {
          console.error("Token não encontrado.");
          setIsOwner(false);
          return;
        }
        const storeProfileId = await getStoreBySlug(slug, token);
        setIsOwner(storeProfileId === profileId);
      } catch (err) {
        console.error("Erro ao buscar loja:", err);
        setIsOwner(false);
      }
    }

    verifyOwner();
  }, [slug, profileId]);

  if (isOwner === null) return <div>Carregando...</div>;
  if (!isOwner) return <Navigate to="/profile" replace />;

  return <>{children}</>;
}
