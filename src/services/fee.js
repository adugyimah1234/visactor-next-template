import api from "@/lib/axios";
// Get all fees with optional filters
export async function getAllFees(params = {}) {
    const response = await api.get("/fees", { params });
    return response.data;
}
// Get a single fee by category and class level
export async function getFee(params) {
    const response = await api.get("/fees/get", { params });
    return response.data;
}
// Create a new fee
export async function createFee(payload) {
    const response = await api.post("/fees", payload);
    return response.data;
}
// Update an existing fee by ID
export async function updateFee(id, payload) {
    const response = await api.put(`/fees/${id}`, payload);
    return response.data;
}
// Delete a fee by ID
export async function deleteFee(id) {
    const response = await api.delete(`/fees/${id}`);
    return response.data;
}
// Get outstanding fees for a specific student
export async function getOutstandingFees(studentId) {
    const response = await api.get(`/fees/outstanding/${studentId}`);
    return response.data;
}
