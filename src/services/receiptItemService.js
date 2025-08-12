import api from "@/lib/axios";
export const getCategoryStats = async () => {
    const response = await api.get('/receipt-items/category-stats');
    return response.data;
};
