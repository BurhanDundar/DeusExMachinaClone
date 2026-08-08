# HTTP API

All request and response bodies use JSON unless noted.

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create account and session |
| POST | `/api/auth/login` | Public | Authenticate and create session |
| POST | `/api/auth/refresh` | Refresh cookie | Rotate session |
| POST | `/api/auth/logout` | Public/idempotent | Revoke and clear session |
| GET | `/api/users/me` | Bearer JWT | Current account |
| PUT | `/api/users/me` | Bearer JWT | Update account profile |
| GET | `/actuator/health` | Public | Container health check |

Successful authentication returns `accessToken`, `tokenType`, `expiresIn`, and
the public user object. The refresh token is never returned in JSON.

Errors use codes such as `VALIDATION_ERROR`, `EMAIL_ALREADY_REGISTERED`,
`INVALID_CREDENTIALS`, `AUTHENTICATION_REQUIRED`, and `USER_NOT_FOUND`.
