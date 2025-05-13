// services/classService.ts
import api from "@/lib/axios";

export const getClasses = async () => {
  const res = await api.get("/classes");
  return res.data;
};

export const createClass = async (data: { name: string; level: number; school_id: number }) => {
  const res = await api.post("/classes", data);
  return res.data;
};
