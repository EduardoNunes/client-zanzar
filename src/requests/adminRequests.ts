import api from "../server/axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

interface CountResponse {
    count: number;
}

export const getPostsCountReq = async (): Promise<CountResponse> => {
    const token = Cookies.get("access_token");

    if (!token) {
        toast.error("Token de acesso não encontrado.");
        return { count: 0 };
    }

    try {
        const response = await api.get("/admin/posts/count", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (error: any) {
        const errorMessage =
            error.response?.data?.message || "Erro ao buscar total de posts.";
        toast.error(errorMessage);
        throw new Error(errorMessage);
    }
};

export const getProductsCountReq = async (): Promise<CountResponse> => {
    const token = Cookies.get("access_token");

    if (!token) {
        toast.error("Token de acesso não encontrado.");
        return { count: 0 };
    }

    try {
        const response = await api.get("/admin/products/count", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (error: any) {
        const errorMessage =
            error.response?.data?.message || "Erro ao buscar total de produtos.";
        toast.error(errorMessage);
        throw new Error(errorMessage);
    }
};

export const getMessagesCountReq = async (): Promise<CountResponse> => {
    const token = Cookies.get("access_token");

    if (!token) {
        toast.error("Token de acesso não encontrado.");
        return { count: 0 };
    }

    try {
        const response = await api.get("/admin/messages/count", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (error: any) {
        const errorMessage =
            error.response?.data?.message || "Erro ao buscar total de mensagens.";
        toast.error(errorMessage);
        throw new Error(errorMessage);
    }
};

export const getAdsCountReq = async (): Promise<CountResponse> => {
    const token = Cookies.get("access_token");

    if (!token) {
        toast.error("Token de acesso não encontrado.");
        return { count: 0 };
    }

    try {
        const response = await api.get("/admin/advertisements/count", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        return response.data;
    } catch (error: any) {
        const errorMessage =
            error.response?.data?.message || "Erro ao buscar total de anúncios.";
        toast.error(errorMessage);
        throw new Error(errorMessage);
    }
};

export interface RecentUser {
    username: string;
    last_sign_in_at: string;
}

export const getRecentUsersReq = async (): Promise<RecentUser[]> => {
    const token = Cookies.get("access_token");

    if (!token) {
        toast.error("Token de acesso não encontrado.");
        return [];
    }

    try {
        const response = await api.get("/admin/users/recent", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            params: {
                limit: 5,
            },
        });

        return response.data;
    } catch (error: any) {
        const errorMessage =
            error.response?.data?.message || "Erro ao buscar usuários recentes.";
        toast.error(errorMessage);
        throw new Error(errorMessage);
    }
};