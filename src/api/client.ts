import axios from "axios";

/**
 * Single axios instance for the whole api/ layer. Base URL matches the
 * confirmed local backend (http://127.0.0.1:8000) plus the /api prefix
 * every router is mounted under in main.py.
 */
export const apiClient = axios.create({
  // baseURL: "https://cslabs-diagnostic-tool.onrender.com/api",
  baseURL: "http://localhost:8000/api",
  headers: { "Content-Type": "application/json" },
});