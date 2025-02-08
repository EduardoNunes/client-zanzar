import api from "../server/axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

export interface Advertisement {
    id: string;
    title: string;
    description: string | null;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    linkUrl: string | null;
    startDate: string;
    endDate: string;
    dailyLimit: string;
    scheduleStart: string;
    scheduleEnd: string;
    showOnStartup: boolean;
    active: boolean;
    views_count: number;
    clicks_count: number;
}

export interface CreateAdvertisementDto {
    title: string;
    description?: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    linkUrl?: string;
    startDate: string;
    endDate: string;
    dailyLimit?: string;
    scheduleStart?: string;
    scheduleEnd?: string;
    showOnStartup: boolean;
    active: boolean;
}

export interface UploadProgressCallback {
    (progress: number): void;
}

export const getAdvertisementsReq = async (): Promise<Advertisement[]> => {
    try {
        const token = Cookies.get('access_token');
        const response = await api.get('/admin/advertisements', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching advertisements:', error);
        toast.error('Failed to fetch advertisements');
        throw error;
    }
};

export const createAdvertisementReq = async (data: CreateAdvertisementDto & { file?: File }): Promise<Advertisement> => {
    try {
        const token = Cookies.get('access_token');
        const formData = new FormData();

        // Append all text fields
        Object.keys(data).forEach(key => {
            const value = data[key as keyof (CreateAdvertisementDto & { file?: File })];
            if (value !== undefined && value !== null && key !== 'file') {
                formData.append(key, String(value));
            }
        });

        // Append file if exists
        if (data.file) {
            formData.append('file', data.file);
        }

        const response = await api.post('/admin/advertisements', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
            }
        });

        toast.success('Advertisement created successfully');
        return response.data;
    } catch (error) {
        console.error('Error creating advertisement:', error);
        toast.error('Failed to create advertisement');
        throw error;
    }
};

export const updateAdvertisementReq = async (id: string, data: CreateAdvertisementDto & { file?: File }): Promise<Advertisement> => {
    try {
        const token = Cookies.get('access_token');
        const formData = new FormData();

        // Append all text fields
        Object.keys(data).forEach(key => {
            const value = data[key as keyof (CreateAdvertisementDto & { file?: File })];
            if (value !== undefined && value !== null && key !== 'file') {
                formData.append(key, String(value));
            }
        });

        // Append file if exists
        if (data.file) {
            formData.append('file', data.file);
        }

        const response = await api.put(`/admin/advertisements/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`
            }
        });

        toast.success('Advertisement updated successfully');
        return response.data;
    } catch (error) {
        console.error('Error updating advertisement:', error);
        toast.error('Failed to update advertisement');
        throw error;
    }
};

export const deleteAdvertisementReq = async (id: string): Promise<void> => {
    try {
        const token = Cookies.get('access_token');
        await api.delete(`/admin/advertisements/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        toast.success('Advertisement deleted successfully');
    } catch (error) {
        console.error('Error deleting advertisement:', error);
        toast.error('Failed to delete advertisement');
        throw error;
    }
};
