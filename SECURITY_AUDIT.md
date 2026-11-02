# GlobalTaste Security Audit (Task #6)

Scope: Flask backend (`backend/app`), its configuration, and the deployed API on Render.
Branch: `elvis/security-audit-cors-config`
Audit date: November 2, 2026
Method: code review, the automated test suite (90 tests passing), and live requests against the deployed backend.

## Summary

| # | Area | Result |
|---|------|--------|
| 1 | Signing secrets (`SECRET_KEY`, `JWT_SECRET_KEY`) | Fixed in code on main; production secrets reset |
| 2 | CORS | Good, verified live |
| 3 | Authentication (JWT) | Good, verified live |
| 4 | Authorization of user-owned data | Good |
| 5 | Admin access | Good, verified live |
| 6 | Custom meals visibility | Good |
| 7 | Login and registration abuse protection | Good |
| 8 | Error handling | Good |
| 9 | Security response headers | Fixed in this branch |
| 10 | Deployment configuration | Issue found and fixed |
| 11 | Remaining risks | See "Recommendations" |

## Findings

### 1. Signing secrets
Originally `create_app` fell back to a public default (`development-only-change-me`) when `SECRET_KEY` or `JWT_SECRET_KEY` was not set, which would let anyone forge login tokens. Main now has `ensure_secrets()` in `security.py`. It refuses to start in production when a secret is missing or is a known placeholder, and only generates a temporary key in development or test mode. `.env.example` holds placeholders only.

The first deploy of this code on Render failed with the expected `RuntimeError`, which showed that the production secrets were missing or placeholders. Both were replaced with new random values and the deploy then succeeded. Existing sessions were ended by the key change.

### 2. CORS
Cross-origin access is an allow-list read from `FRONTEND_ORIGIN`, not a wildcard. Verified on the live backend:
- Request from the Netlify frontend origin: the response allows that origin.
- Request from an unknown origin: no CORS headers are returned.

### 3. Authentication
All `/api/me/*`, account and admin routes use `@jwt_required()`. Tokens expire after one hour, can be revoked on logout, and are invalidated when the account is deleted or its password changes (`token_version`). Verified live after the latest deploy: a missing token returns `401 AUTH_REQUIRED` and an invalid token returns `401 TOKEN_INVALID`.

### 4. Authorization of user-owned data
Every favorites, planner and basket query filters on the logged-in user's id (`current_user().id`). Meal ids in URLs are only looked up inside that user's own records, so changing an id cannot reach another user's data.

### 5. Admin access
All `/api/admin/*` routes check `@jwt_required()` and then `is_admin()`, which compares the account email against the server-side `ADMIN_EMAILS` setting. Verified live: a normal account receives `200` on its own data and `403` on `/api/admin/customers` and `/api/admin/meals`.

The admin page (`/` and `/admin`) serves only a login form; customer data is fetched after a successful admin login, and the token is kept in a JavaScript variable, not in browser storage. Values are inserted with `textContent`, which avoids script injection from user-supplied fields.

### 6. Custom meals
`find_visible_meal` returns a meal only if it is public or owned by the caller, and `_owned_meal` returns the same "not found" answer for missing and not-yours meals, so private meals cannot be detected. Adding someone else's private custom meal to favorites, the planner or the basket is rejected. The public listing exposes only the owner's display name, not their email.

### 7. Abuse protection
Failed logins are rate limited per email and per client address, registration is limited per address, and unknown emails cost the same time as known ones (no timing leak). Passwords are hashed.

### 8. Error handling
Custom handlers return generic JSON errors for 404, 409 and 500, so stack traces are not exposed. The deployment runs under gunicorn, not the Flask debug server.

### 9. Security headers (fixed in this branch)
The app sent no hardening headers. `__init__.py` now sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` (prevents the admin page being embedded in another site), `Referrer-Policy: no-referrer`, and `Strict-Transport-Security` on HTTPS requests. Covered by `tests/test_security_headers.py`. These headers appear in production once this branch is merged into main and deployed.

### 10. Deployment configuration
The Render service was deploying the branch `docs/backend-deployment-link`, not `main`, so production was running old code that lacked the token handling, rate limiting and secret checks described above. The service was switched to deploy `main`. The start command runs `flask db upgrade` before gunicorn, so migrations are applied on every deploy; the latest deploy applied two pending migrations successfully.

## Recommendations and accepted risks

| Item | Severity | Note |
|------|----------|------|
| Basket price is taken from the client request | Low | Only affects the user's own basket and there is no checkout. Look prices up on the server if payments are added. |
| Account lockout after 5 failed logins | Accepted | Someone can lock out a known email for 15 minutes. This is the normal trade-off for per-account lockouts. |
| Client address for rate limiting uses the last `X-Forwarded-For` value | Verify | Correct if Render's proxy appends the real client address. If every user shares one address, the per-address limit would lock everyone out together. |
| No `Content-Security-Policy` header | Low | The admin page uses an inline script, so a policy needs a nonce or the script moved to a file. |
| Admin password strength | Medium | A weak admin password was found during live testing. Admin passwords should be long and unique. |
| Render builds with Python 3.14 while tests run on 3.12 | Low | Pin the Python version on Render to match the tested version (tracked in task #9). |

## Live verification checklist

- [x] Test suite passes (90 tests)
- [x] CORS allows the Netlify origin and blocks an unknown origin
- [x] Render runs the app with gunicorn
- [x] Latest main is deployed on Render (`AUTH_REQUIRED` and `TOKEN_INVALID` responses confirmed)
- [x] A normal (non-admin) account gets `403` on `/api/admin/customers` and `/api/admin/meals`
- [X] `ADMIN_EMAILS` on Render contains only real admin addresses
- [X] Admin passwords rotated to strong values
- [X] Security headers confirmed on production after this branch is merged