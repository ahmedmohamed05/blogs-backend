# API Documentation

Base URL: `http://localhost:3000/api` (Default development URL)

## Authentication Endpoints

Base Path: `/api/auth`

### 1. Register User
Creates a new user account. The account is created as "unverified". An OTP is sent to the provided email address to complete verification.

- **Endpoint**: `POST /register`
- **Rate Limit**: Applied (Register Rate Limiter)
- **Request Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "username": "johndoe",
    "password": "securepassword123" // Minimum 6 characters
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "expiresAt": "2023-10-27T10:00:00.000Z",
    "message": "We sent you a mil with your OTP"
  }
  ```

### 2. Login
Authenticates a user.

- **Endpoint**: `POST /login`
- **Rate Limit**: Applied (Login Rate Limiter)
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "password": "securepassword123"
  }
  ```
- **Response (200 OK - If Verified)**:
  - **Cookies**: `accessToken` (HttpOnly), `refreshToken` (HttpOnly)
  - **Body**: User Information (excluding sensitive data)
    ```json
    {
      "id": "uuid...",
      "firstName": "John",
      "lastName": "Doe",
      "username": "johndoe",
      "email": "john.doe@example.com",
      "isAccountVerified": true,
      ...
    }
    ```
- **Response (200 OK - If Unverified)**:
  - If the account exists but is not verified, credentials are valid but login is incomplete.
  - **Body**:
    ```json
    {
      "message": "We sent you a mil with your OTP"
    }
    ```

### 3. Verify OTP (Login via OTP)
Verifies the OTP sent to the user's email. This endpoint is used for:
1. Verifying a new account after registration.
2. Completing a login for unverified accounts.
3. **Email & OTP Login**: Logging in directly if you have a valid OTP (and bypass password if implemented/used as 2FA).

- **Endpoint**: `POST /verify-otp`
- **Request Body**:
  ```json
  {
    "email": "john.doe@example.com",
    "otp": "123456" // 6 digits
  }
  ```
- **Response (200 OK)**:
  - **Cookies**: Sets `accessToken` and `refreshToken`.
  - **Body**: User Information.
    ```json
    {
      "id": "uuid...",
      "firstName": "John",
      ...
    }
    ```

### 4. Send OTP
Request a new OTP to be sent to the user's email.

> **Note**: This endpoint currently requires an `accessToken` (via cookie), implying it is for authenticated users (e.g., re-verification) rather than a public "Forgot Password" or "Magic Link" flow.

- **Endpoint**: `POST /send-otp`
- **Request Headers/Cookies**: Requires `accessToken` cookie.
- **Body**: (Empty or implied by token user context)
- **Response**: (Subject to implementation - currently pending)

### 5. Refresh Token
Generates new access and refresh tokens using a valid refresh token.

- **Endpoint**: `POST /refresh`
- **Request Headers/Cookies**: Requires `refreshToken` cookie.
- **Response (200 OK)**:
  - **Cookies**: Updates `accessToken` and `refreshToken`.

### 6. Logout
Invalidates the refresh token and clears auth cookies.

- **Endpoint**: `POST /logout`
- **Request Headers/Cookies**: Requires `refreshToken` cookie.
- **Response (200 OK)**: OK status.

---

## Email & OTP Login Flow

The API supports an OTP-based verification/login mechanism.

1.  **Initiation**:
    - **Registration**: Registering triggers an OTP.
    - **Login (Unverified)**: Attempting to login with correct credentials on an unverified account triggers an OTP resend.
    - **Manual Request**: Authenticated users can request an OTP via `/send-otp` (Implementation pending update for unauthenticated access).

2.  **Completion**:
    - The user submits the OTP to `POST /verify-otp` with their email.
    - On success, the server issues full authentication cookies (`accessToken`, `refreshToken`) and returns the user profile, effectively logging them in.

This allows `verify-otp` to act as a final authentication step.
