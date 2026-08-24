# HTTP API

All request and response bodies use JSON unless noted.

| Method | Path                                    | Access            | Purpose                         |
| ------ | --------------------------------------- | ----------------- | ------------------------------- |
| POST   | `/api/auth/register`                    | Public            | Create account and session      |
| POST   | `/api/auth/login`                       | Public            | Authenticate and create session |
| POST   | `/api/auth/refresh`                     | Refresh cookie    | Rotate session                  |
| POST   | `/api/auth/logout`                      | Public/idempotent | Revoke and clear session        |
| GET    | `/api/users/me`                         | Bearer JWT        | Current account                 |
| PUT    | `/api/users/me`                         | Bearer JWT        | Update account profile          |
| GET    | `/actuator/health`                      | Public            | Container health check          |
| GET    | `/api/checkout/config`                  | Public            | Shipping and reservation rules  |
| POST   | `/api/orders`                           | Bearer JWT        | Reserve stock and create order  |
| GET    | `/api/orders`                           | Bearer JWT        | Current customer’s orders       |
| GET    | `/api/orders/{id}`                      | Owner JWT         | Owned order detail              |
| GET    | `/api/admin/orders`                     | Admin JWT         | All orders                      |
| PUT    | `/api/admin/orders/{id}/fulfillment`    | Admin JWT         | Advance/cancel fulfillment      |
| POST   | `/api/newsletter/subscriptions`         | Public            | Subscribe with consent          |
| DELETE | `/api/newsletter/subscriptions/{token}` | Public            | Idempotent unsubscribe          |

Successful authentication returns `accessToken`, `tokenType`, `expiresIn`, and
the public user object. The refresh token is never returned in JSON.

Errors use codes such as `VALIDATION_ERROR`, `EMAIL_ALREADY_REGISTERED`,
`INVALID_CREDENTIALS`, `AUTHENTICATION_REQUIRED`, and `USER_NOT_FOUND`.
Repeated failed logins return `LOGIN_RATE_LIMITED` with HTTP 429. Order errors
include stable codes for insufficient stock, invalid state transitions and
missing tracking information.
