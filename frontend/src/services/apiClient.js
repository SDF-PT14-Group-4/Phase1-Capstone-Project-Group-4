// Fetch wrapper for requests that carry the login token.
//
// A 401 on a request that sent a token means the session ended (expired,
// logged out elsewhere, password changed, account deleted). Announce it once
// so AuthContext can log the user out everywhere and show a clear message.
export const AUTH_EXPIRED_EVENT = "globaltaste:auth-expired";

export const SESSION_EXPIRED_MESSAGE =
  "Your session has expired. Please log in again.";

function sentToken(options) {
  const header = options?.headers?.Authorization;
  return typeof header === "string" && header.startsWith("Bearer ");
}

export async function authFetch(url, options = {}) {
  const response = await fetch(url, options);
  if (response?.status === 401 && sentToken(options)) {
    window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
  }
  return response;
}
