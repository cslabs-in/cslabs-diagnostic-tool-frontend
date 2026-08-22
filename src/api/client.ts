import axios from "axios";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api";

/**
 * Single axios instance for the whole api layer. Deployments provide
 * VITE_API_BASE_URL (including the /api prefix); local development keeps the
 * existing FastAPI default.
 */
export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});
