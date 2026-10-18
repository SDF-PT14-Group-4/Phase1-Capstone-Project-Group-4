const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL = (
  configuredBaseUrl ||
  (import.meta.env.DEV
    ? "http://127.0.0.1:5000/api"
    : "https://globaltaste-api.onrender.com/api")
).replace(/\/+$/, "");

export function requireApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error(
      "The account API is not configured. Set VITE_API_BASE_URL to the deployed API URL and rebuild the frontend."
    );
  }
  return API_BASE_URL;
}
