import axios from "axios";

const isMockMode = import.meta.env.VITE_MSW_ENABLED === "true";

export const apiClient = axios.create({
  baseURL: isMockMode ? "" : import.meta.env.VITE_API_BASE_URL,
});
