import ApiError from "../utils/apiError";
import { Request, Response } from "express";
import jwtConfig from "../config/jwt";
import AuthServices from "../services/auth.services";
import { OTPPurpose } from "../types/otp.types";
import { UserVerified } from "../types/auth.types";

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

		res.status(200).json({ message: "We sent you a mail with your OTP" });
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

		const { userInfo } = await AuthServices.verifyAccount(email, otp);
		const { accessToken, refreshToken, user } = userInfo;

		res.cookie("accessToken", accessToken, jwtConfig.accessCookieOptions);
		res.cookie("refreshToken", refreshToken, jwtConfig.refreshCookieOptions);
		res.status(200).json(user);
	}

	static async changePassword(req: Request, res: Response) {
		const { username, currentPassword, newPassword } = req.body;

		await AuthServices.changePassword(username, currentPassword, newPassword);
		await AuthServices.logout(req.cookies.refreshToken);

		const { userInfo } = (await AuthServices.login(
			username,
			newPassword
		)) as UserVerified;

		const { accessToken, refreshToken, user } = userInfo;
		res.cookie("accessToken", accessToken, jwtConfig.accessCookieOptions);
		res.cookie("refreshToken", refreshToken, jwtConfig.refreshCookieOptions);
		res.status(200).json(user);
	}

	static async forgotPassword(req: Request, res: Response) {
		const { email } = req.body;
		const result = await AuthServices.forgotPassword(email);
		res.status(200).json(result);
	}

	static async resetPassword(req: Request, res: Response) {
		const { email, otp, newPassword } = req.body;
		const result = await AuthServices.resetPassword(email, otp, newPassword);
		res.status(200).json(result);
	}
}

/*

	static async sendOTP(req: Request, res: Response) {
		const { email, purpose } = req.body;
		let purposeEnum = OTPPurpose.emailVerification;
		if (purpose === "passwordReset") purposeEnum = OTPPurpose.passwordReset;
		else if (purpose === "twoStepAuth") purposeEnum = OTPPurpose.twoStepAuth;

		const result = await AuthServices.sendOTP(email, purposeEnum);
		res.status(200).json(result);
	}

*/
