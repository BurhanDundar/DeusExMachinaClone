# Authentication and security

- Passwords are hashed with BCrypt strength 12.
- Access tokens are signed with HS256, contain user ID, email and role, and
  expire after 15 minutes by default.
- The signing secret must be at least 32 bytes and comes from `JWT_SECRET`.
- Access tokens live only in frontend memory.
- Refresh tokens are 256-bit random values delivered as HttpOnly cookies; only
  SHA-256 digests are stored.
- Refresh tokens rotate on every refresh. Reuse of a revoked token is rejected.
- Refresh-token lookup takes a database write lock during rotation so concurrent
  reuse cannot create two valid successor sessions.
- Production cookies use `Secure`; `SameSite` is configurable for separate
  frontend/API domains.
- Authentication errors do not disclose whether an account exists.
- `/api/users/**` requires authentication. Future admin APIs will use
  `ROLE_ADMIN` without changing the user model.

For local development the cookie may be non-Secure so `http://localhost` works.
Production must set `COOKIE_SECURE=true`, a strong secret, and explicit allowed
origins.
