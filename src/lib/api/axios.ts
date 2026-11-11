import axios, { AxiosError, AxiosInstance } from "axios";

function getBaseUrl(): string {
  if (typeof window !== "undefined") return "/api";
  const configured = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return `${configured.replace(/\/+$/, "")}/api`;
  return "http://localhost:3000/api";
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    const errorMsg =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "Terjadi kesalahan pada jaringan";
    return Promise.reject(new Error(errorMsg));
  }
);

export default apiClient;

