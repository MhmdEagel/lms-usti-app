import axios from "axios";
import { environtment } from "@/config/environtment";
import { getAccessToken } from "@/actions/get-token";
const headers = {
  "Content-Type": "application/json",
};
const instance = axios.create({
  baseURL: environtment.API_URL,
  headers,
  timeout: 60 * 1000,
});
instance.interceptors.request.use(async (config) => {
  const accessToken = await getAccessToken();
  config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});
instance.interceptors.response.use(
  async (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/auth")) {
        const currentPath = window.location.pathname;
        const loginUrl = currentPath && currentPath !== "/"
          ? `/auth/login?callbackUrl=${encodeURIComponent(currentPath)}`
          : "/auth/login";
        window.location.href = loginUrl;
      }
    }
    return Promise.reject(error);
  },
);
export default instance;
