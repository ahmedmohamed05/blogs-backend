import rateLimit from "express-rate-limit";

export const REGISTER_RATE_LIMITER = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 3,
	message: "Too many registration attempts",
	skipSuccessfulRequests: true,
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req, res) => {
		res.status(429).json({
			error: "Too many login attempts",
			retryAfter: 15 * 60, // seconds
			message: "Please try again after 15 minutes",
		});
	},
});

export const LOGIN_RATE_LIMITER = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 5,
	message: "Too many login attempts",
	skipSuccessfulRequests: true,
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req, res) => {
		res.status(429).json({
			error: "Too many login attempts",
			retryAfter: 15 * 60, // seconds
			message: "Please try again after 15 minutes",
		});
	},
});

export const API_RATE_LIMITER = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
	message: "Too many requests",
});
