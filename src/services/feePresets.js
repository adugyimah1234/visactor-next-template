// services/feePresets.ts
import api from "@/lib/axios";
export const getFeePresets = async () => {
    const response = await api.get("/fees/presets");
    return response.data;
};
