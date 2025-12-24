import axios from "axios";
import { getAccessToken } from "./auth";

const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;


