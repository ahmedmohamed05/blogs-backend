import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import { verifyRefreshCookie } from "../middlewares/verify-cookies.middleware";
import validateRequestSchema from "../middlewares/validate.middleware";
import RequestSchemas from "../schemas/auth.schema";
import {
	LOGIN_RATE_LIMITER,
	REGISTER_RATE_LIMITER,
} from "../config/rate-limits";
const authRouter = Router();

// POST /api/auth/register create not verified user and send and OTP
authRouter.post(
	"/register",
	// REGISTER_RATE_LIMITER,
	validateRequestSchema(RequestSchemas.register),
	AuthController.register
);

// POST /apu/auth/verify-account verify created account via OTP
authRouter.post(
	"/verify-account",
	validateRequestSchema(RequestSchemas.accountVerification),
	AuthController.verifyAccount
);

// POST /api/auth/login login a user only if he/she verified via username & password
authRouter.post(
	"/login",
	// LOGIN_RATE_LIMITER,
	validateRequestSchema(RequestSchemas.login),
	AuthController.login
);

// POST /api/auth/logout clean up tokens
authRouter.post(
	"/logout",
	validateRequestSchema(RequestSchemas.refreshCookie, "cookies"),
	AuthController.logout
);

// POST /api/auth/refresh generate new refresh and access tokens
authRouter.post(
	"/refresh",
	validateRequestSchema(RequestSchemas.refreshCookie, "cookies"),
	verifyRefreshCookie,
	AuthController.refreshTokens
);

authRouter.post(
	"/change-password",
	validateRequestSchema(RequestSchemas.changePassword),
	AuthController.changePassword
);

// authRouter.post(
// 	"/send-otp",
// 	validateRequestSchema(RequestSchemas.sendOTP),
// 	AuthController.sendOTP
// );

authRouter.post(
	"/forgot-password",
	validateRequestSchema(RequestSchemas.forgotPassword),
	AuthController.forgotPassword
);

authRouter.post(
	"/reset-password",
	validateRequestSchema(RequestSchemas.resetPassword),
	AuthController.resetPassword
);

export default authRouter;
