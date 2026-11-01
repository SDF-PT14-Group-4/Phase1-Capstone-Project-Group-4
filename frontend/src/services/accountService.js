import { authFetch } from "./apiClient.js";
import { API_BASE_URL } from "./authService.js";

export const DIETARY_OPTIONS = [
  "vegetarian",
  "vegan",
  "pescatarian",
  "gluten-free",
  "dairy-free",
  "nut-free",
  "halal",
  "kosher",
  "low-carb",
];

export class AccountApiError extends Error {
  constructor(message, code = "ACCOUNT_REQUEST_FAILED", status = 0) {
    super(message);
    this.name = "AccountApiError";
    this.code = code;
    this.status = status;
  }
}

async function requestAccount(path, accessToken, options = {}) {
  let response;
  try {
    response = await authFetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
      },
    });
  } catch {
    throw new AccountApiError(
      "Unable to connect to GlobalTaste. Check your connection and try again.",
      "NETWORK_ERROR"
    );
  }

  if (response.status === 204) return null;

  let data;
  try {
    data = await response.json();
  } catch {
    throw new AccountApiError(
      "The account service returned an invalid response.",
      "INVALID_RESPONSE",
      response.status
    );
  }

  if (!response.ok) {
    throw new AccountApiError(
      data?.error?.message || "Unable to complete your request.",
      data?.error?.code || "ACCOUNT_REQUEST_FAILED",
      response.status
    );
  }
  return data;
}

export function getAccount(accessToken) {
  return requestAccount("/me", accessToken);
}

export function updateProfile(accessToken, { displayName, dietaryPreferences }) {
  return requestAccount("/me", accessToken, {
    method: "PATCH",
    body: JSON.stringify({ displayName, dietaryPreferences }),
  });
}

// Returns a fresh session: the old token stops working after a password change.
export async function changePassword(accessToken, currentPassword, newPassword) {
  const data = await requestAccount("/me/password", accessToken, {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (typeof data?.accessToken !== "string" || !data.accessToken) {
    throw new AccountApiError(
      "The account service returned an invalid response.",
      "INVALID_RESPONSE"
    );
  }
  return data;
}

export function deleteAccount(accessToken, password) {
  return requestAccount("/me", accessToken, {
    method: "DELETE",
    body: JSON.stringify({ password }),
  });
}
