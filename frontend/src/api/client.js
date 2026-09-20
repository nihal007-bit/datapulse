import axios from "axios";

// In local dev, Vite proxies "/api" to the backend (see vite.config.js).
// In production, set VITE_API_URL to the deployed backend's full URL.
const baseURL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api";
const client = axios.create({ baseURL });

export const uploadTransactions = (file, kind) => {
  const formData = new FormData();
  formData.append("file", file);
  return client.post(`/upload?kind=${kind}`, formData);
};

export const getByCategory = () => client.get("/analytics/by-category").then((r) => r.data);
export const getMonthly = () => client.get("/analytics/monthly").then((r) => r.data);
export const getAnomalies = () => client.get("/analytics/anomalies").then((r) => r.data);
export const getForecast = () => client.get("/predict/forecast").then((r) => r.data);
export const getRisk = () => client.get("/predict/risk").then((r) => r.data);
export const getCategoryTrend = () => client.get("/analytics/category-trend").then((r) => r.data);
export const getByWeekday = () => client.get("/analytics/by-weekday").then((r) => r.data);
export const getTransactions = (params) => client.get("/transactions", { params }).then((r) => r.data);
export const updateTransaction = (id, payload) => client.put(`/transactions/${id}`, payload).then((r) => r.data);
export const deleteTransaction = (id) => client.delete(`/transactions/${id}`).then((r) => r.data);
export const clearAllTransactions = () => client.delete("/transactions/all").then((r) => r.data);

export const getBudgets = () => client.get("/budgets").then((r) => r.data);
export const upsertBudget = (category, monthly_limit) =>
  client.post("/budgets", { category, monthly_limit }).then((r) => r.data);
export const deleteBudget = (category) => client.delete(`/budgets/${category}`).then((r) => r.data);
