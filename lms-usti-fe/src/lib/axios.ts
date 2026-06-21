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
  (response) => response,
  (error) => Promise.reject(error),
);
export default instance;
