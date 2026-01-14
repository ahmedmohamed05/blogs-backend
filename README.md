# Blogs Backend

Backend service for the Blogs application, built with Express, TypeScript, and Prisma.

## Prerequisites

- Node.js (v18 or higher recommended)
- PostgreSQL
- npm or yarn

## Setup

1.  **Clone the repository** (if you haven't already).
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Configuration**:
    Create a `.env` file in the root directory. You can use `.env.example` as a template (if available) or ensure the following variables are set:
    ```env
    PORT=8080
    DATABASE_URL="postgresql://user:password@localhost:5432/db_name"
    JWT_ACCESS_SECRET="your_access_secret"
    JWT_REFRESH_SECRET="your_refresh_secret"
    NODE_ENV="development"
    AUTH_EMAIL="your_email_service_user"
    AUTH_PASSWORD="your_email_service_password"
    OTP_SECRET="your_otp_secret"
    ```
4.  **Database Setup**:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

## Running the Server

-   **Development Mode**:
    ```bash
    npm run dev
    ```
    The server will start at `http://localhost:8080`.

-   **Production Build**:
    ```bash
    npm run build
    npm start
    ```

## API Documentation

Detailed API documentation can be found in [docs/API.md](docs/API.md).

## Features

-   **Authentication**:
    -   Register with Email & OTP verification.
    -   Login (username/password).
    -   Access & Refresh Token management (HttpOnly cookies).
    -   Forgot Password & Reset Password flows.
    -   Resend OTP.
    -   Strong password enforcement.
    -   Rate limiting on auth endpoints.
