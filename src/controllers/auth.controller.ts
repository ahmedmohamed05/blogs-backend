import ApiError from "../utils/apiError";
import { Request, Response } from "express";
import jwtConfig from "../config/jwt";
import AuthServices from "../services/auth.services";
import { OTPPurpose } from "../types/otp.types";
import { throwDeprecation } from "node:process";

export default class AuthController {
	static async register(req: Request, res: Response) {
		const { firstName, lastName, email, username, password } = req.body || {};

		const result = await AuthServices.registerNewUser(
			firstName,
			lastName,
			email,
			username,
			password
		);

		if (!result.isAccountVerified) {
			const { expiresAt, message } = result.otpInfo;
			return res.status(200).json({ expiresAt, message });
		}

		// This should never happen
		throw new ApiError(400, "WTF, how the account is already verified");
	}

	static async login(req: Request, res: Response) {
		const { username, password } = req.body || {};

		const loginResponse = await AuthServices.login(username, password);

		if (loginResponse.isAccountVerified) {
			const { accessToken, refreshToken, user } = loginResponse.userInfo;
			res.cookie("accessToken", accessToken, jwtConfig.accessCookieOptions);
			res.cookie("refreshToken", refreshToken, jwtConfig.refreshCookieOptions);
			res.status(200).json(user);
		}

		res.status(200).json({ message: "We sent you a mil with your OTP" });
	}

	static async logout(req: Request, res: Response) {
		const { refreshToken } = req.cookies || {};

		res.clearCookie("accessToken", jwtConfig.accessCookieOptions);
		res.clearCookie("refreshToken", jwtConfig.refreshCookieOptions);

		await AuthServices.logout(refreshToken);

		res.sendStatus(200);
	}

	static async refreshTokens(req: Request, res: Response) {
		const { refreshToken: oldRefreshToken } = req.cookies || {};

		// Extra protection, We already passed the middleware
		if (!oldRefreshToken)
			throw new ApiError(401, "Unauthorized no refresh token provided");

		const { accessToken, refreshToken } = await AuthServices.refreshTokens(
			oldRefreshToken
		);

		res.cookie("accessToken", accessToken, jwtConfig.accessCookieOptions);
		res.cookie("refreshToken", refreshToken, jwtConfig.refreshCookieOptions);

		res.sendStatus(200);
	}

	private static async sendOTP_m(email: string, purpose: OTPPurpose) {
		const result = AuthServices.sendOTP(email, purpose);
		return result;
	}

	static async verifyAccount(req: Request, res: Response) {
		const { email, otp } = req.body;

		const { userData } = await AuthServices.verifyOTP(email, otp);
		const { accessToken, refreshToken, user } = userData;

		const { hashedPassword, id, ...safeUser } = user;

		res.cookie("accessToken", accessToken, jwtConfig.accessCookieOptions);
		res.cookie("refreshToken", refreshToken, jwtConfig.refreshCookieOptions);
		res.status(200).json(safeUser);
	}

	static async changePassword(req: Request, res: Response) {
		const { username, currentPassword, newPassword } = req.body;

		const ret = await AuthServices.changePassword(
			username,
			currentPassword,
			newPassword
		);

		if (ret.isAccountVerified) {
			const { accessToken, refreshToken, user } = ret.userInfo;
			res.cookie("accessToken", accessToken, jwtConfig.accessCookieOptions);
			res.cookie("refreshToken", refreshToken, jwtConfig.refreshCookieOptions);
			res.status(200).json(user);
		}

		throw new ApiError(
			409,
			"You can't update your password until you verify your account"
		);
	}
}
