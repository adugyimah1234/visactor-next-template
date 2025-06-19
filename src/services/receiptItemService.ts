import api from "@/lib/axios";

export interface CategoryStat {
  receipt_type: string;
  total_amount: number;
  count: number;
}

export const getCategoryStats = async (): Promise<CategoryStat[]> => {
  const response = await api.get('/receipt-items/category-stats');
  return response.data;
};
