import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Tambahkan interceptor untuk menyertakan token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("supplier_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
