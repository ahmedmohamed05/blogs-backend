import { CookieOptions } from "express";
import env from "./env";

const jwtConfig = {
	accessTokenExpiry: 30 * 60, // 30 minutes
	accessCookieOptions: {
		httpOnly: true,
		sameSite: "lax" as boolean | "lax" | "strict" | "none" | undefined,
		secure: env.nodeEnv === "production",
		path: "api/",
		maxAge: 30 * 60 * 1000, // 30 minutes
	} as CookieOptions,

	refreshTokenExpiry: 7 * 24 * 60 * 60, // 7 days
	refreshCookieOptions: {
		httpOnly: true,
		sameSite: "lax" as boolean | "lax" | "strict" | "none" | undefined,
		secure: env.nodeEnv === "production",
		path: "/api/auth/",
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
	} as CookieOptions,
};

export default jwtConfig;
