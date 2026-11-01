// Reads the expiry time (ms since epoch) out of a JWT without verifying it.
// Only used to end a session on the client at the right moment; the server
// always makes the real decision. Opaque or malformed tokens return null.
export function getTokenExpiry(token) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const exp = JSON.parse(atob(padded)).exp;
    return typeof exp === "number" ? exp * 1000 : null;
  } catch {
    return null;
  }
}

export function isTokenExpired(token, now = Date.now()) {
  const expiry = getTokenExpiry(token);
  return expiry !== null && expiry <= now;
}
