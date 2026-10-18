import { requireApiBaseUrl } from "./apiConfig.js";

const AUTH_STORAGE_KEY = "globaltaste.auth";

export class AuthApiError extends Error {
  constructor(message, code = "AUTH_REQUEST_FAILED", status = 0) {
    super(message);
    this.name = "AuthApiError";
    this.code = code;
    this.status = status;
  }
}

export { AUTH_STORAGE_KEY };

export async function authenticate(path, credentials) {
  let apiBaseUrl;
  try {
    apiBaseUrl = requireApiBaseUrl();
  } catch (error) {
    throw new AuthApiError(error.message, "API_NOT_CONFIGURED");
  }

  let response;
  try {
    response = await fetch(`${apiBaseUrl}/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
  } catch {
    throw new AuthApiError(
      "Unable to connect to the account service. Check your connection and try again.",
      "NETWORK_ERROR"
    );
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new AuthApiError(
      "The account service returned an invalid response.",
      "INVALID_RESPONSE",
      response.status
    );
  }

  if (!response.ok) {
    throw new AuthApiError(
      data?.error?.message || "The account service could not complete your request.",
      data?.error?.code || "AUTH_REQUEST_FAILED",
      response.status
    );
  }

  if (
    typeof data?.accessToken !== "string" ||
    !data.accessToken ||
    !data.user ||
    typeof data.user.id !== "number" ||
    typeof data.user.email !== "string"
  ) {
    throw new AuthApiError(
      "The account service returned an invalid response.",
      "INVALID_RESPONSE",
      response.status
    );
  }

  return {
    accessToken: data.accessToken,
    user: { id: data.user.id, email: data.user.email },
  };
}
