import api from "@/lib/axios";
// API Calls
// Get all receipts with optional filters
export async function getReceipts(filters = {}) {
    const response = await api.get("/fees/receipts", { params: filters });
    return response.data;
}
// Get single receipt by ID
export async function getReceipt(id) {
    const response = await api.get(`/fees/receipts/${id}`);
    return response.data;
}
// Create a new receipt
export async function createReceipt(payload) {
    const response = await api.post("/fees/receipts", payload);
    return response.data.data;
}
// Get printable version (HTML) of a receipt
export async function getPrintableReceipt(id) {
    const response = await api.get(`/fees/receipts/${id}/print`, {
        headers: { Accept: "text/html" }
    });
    return response.data;
}
export async function uploadReceiptLogo(file) {
    const formData = new FormData();
    formData.append("logo", file);
    const response = await api.post("/fees/receipts/upload-logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.logo_url; // Returns the uploaded logo path
}
