# API Documentation

Base URL: `http://localhost:8080/api` (Default development URL)

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
    "password": "SecurePassword123!" // Min 6 chars, 1 upper, 1 lower, 1 number, 1 special
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "expiresAt": "2023-10-27T10:00:00.000Z",
    "message": "We sent you a mail with your OTP"
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
      "message": "We sent you a mail with your OTP"
    }
    ```

### 3. Verify Account
Verifies the created account using the OTP sent to the email.

- **Endpoint**: `POST /verify-account`
- **Request Body**:
  ```json
  {
    "email": "john.doe@example.com",
    "otp": "123456" // 6 digits
  }
  ```
- **Response (200 OK)**:
  - **Cookies**: Sets `accessToken` and `refreshToken`.
  - **Body**: User Information (excluding sensitive data).
    ```json
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "username": "johndoe",
      "isVerified": true,
      ...
    }
    ```

### 4. Change Password
Allows a user to change their password by providing the current one.

- **Endpoint**: `POST /changePassword`
- **Request Body**:
  ```json
  {
    "username": "johndoe",
    "currentPassword": "oldpassword123",
    "newPassword": "newpassword123"
  }
  ```
- **Response (200 OK)**:
  - **Cookies**: Updates `accessToken` and `refreshToken`.
  - **Body**: User Information.

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

### 7. Resend OTP
Resends an OTP to the user's email.

- **Endpoint**: `POST /send-otp`
- **Request Body**:
  ```json
  {
    "email": "john.doe@example.com",
    "purpose": "emailVerification" // "emailVerification" | "passwordReset" | "twoStepAuth"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "expiresAt": "...",
    "message": "We sent you an OTP, Check your mail!"
  }
  ```

### 8. Forgot Password
Initiates the password reset flow.

- **Endpoint**: `POST /forgot-password`
- **Request Body**:
  ```json
  {
    "email": "john.doe@example.com"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "expiresAt": "...",
    "message": "We sent you a password reset code, Check your mail!"
  }
  ```

### 9. Reset Password
Resets the password using OTP.

- **Endpoint**: `POST /reset-password`
- **Request Body**:
  ```json
  {
    "email": "john.doe@example.com",
    "otp": "123456",
    "newPassword": "NewSecurePassword123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Password reset successfully"
  }
  ```

---

## Email & OTP Login Flow

The API supports an OTP-based verification/login mechanism.

1.  **Initiation**:
    - **Registration**: Registering triggers an OTP.
    - **Login (Unverified)**: Attempting to login with correct credentials on an unverified account triggers an OTP resend.
    - **Manual Request**: Authenticated users or users in the forgot password flow can request an OTP via `/send-otp`.

2.  **Completion**:
    - The user submits the OTP to `POST /verify-account` (for registration) or `POST /reset-password` (for password recovery) with their email.
    - On success, the server issues full authentication cookies (`accessToken`, `refreshToken`) and returns the user profile, effectively logging them in (for verification).

This allows `verify-account` to act as a final authentication step for new users.
