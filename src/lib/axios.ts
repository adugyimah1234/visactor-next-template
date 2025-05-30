import axios from 'axios';

const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    // const storedToken = localStorage.getItem('authToken');

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true, // if you use cookies
   headers: {
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

export default api;
