const DEFAULT_API_URL = import.meta.env.PROD
  ? "https://phase1-capstone-project-group-4.onrender.com/api"
  : "http://127.0.0.1:5000/api";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || DEFAULT_API_URL
).replace(/\/+$/, "");

const AUTH_STORAGE_KEY = "globaltaste.auth";

export { API_BASE_URL };

export const PASSWORD_MIN_LENGTH = 10;
export const PASSWORD_HINT =
  "Use at least 10 characters with a letter and a number, symbol or space. Avoid common passwords and your email name.";

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
  let response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/${path}`, {
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
    user: {
      id: data.user.id,
      email: data.user.email,
      ...(typeof data.user.displayName === "string" && data.user.displayName
        ? { displayName: data.user.displayName }
        : {}),
    },
  };
}

// Tells the server to end this session. Best effort: the local session is
// cleared by the caller whether or not this request succeeds.
export async function endSession(accessToken) {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  } catch {
    // Offline or server down: nothing more to do.
  }
}
