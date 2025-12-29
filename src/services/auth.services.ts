import UserModel from "../models/user.model";
import ApiError from "../utils/apiError";
import bcrypt from "bcrypt";
import OTPServices from "./otp.services";
import OTPModel from "../models/otp.model";
import { OTPPurpose } from "../types/otp.types";
import {
	AuthResponse,
	UserNotVerified,
	UserVerified,
} from "../types/auth.types";
import TokensServices from "./tokesn.services";

export default class AuthServices {
	// Register unverified new user
	static async registerNewUser(
		firstName: string,
		lastName: string,
		email: string,
		username: string,
		password: string
	): Promise<UserNotVerified> {
		const isUsernameUsed = await UserModel.findByUsername(username);
		if (isUsernameUsed)
			throw new ApiError(409, "User with this username already exists");

		const isEmailUsed = await UserModel.findByEmail(email);
		if (isEmailUsed)
			throw new ApiError(409, "User with this email already exists");

		const hashedPassword = await bcrypt.hash(password, 10);

		await UserModel.create(
			firstName,
			lastName,
			email,
			username,
			hashedPassword
		);

		const expiresAt = await OTPServices.generateAndSend(
			email,
			OTPPurpose.emailVerification
		);

		return {
			isAccountVerified: false,
			otpInfo: {
				expiresAt,
				message: "We sent you a verification code, Check your mails!",
			},
		};
	}

	static async login(
		username: string,
		password: string
	): Promise<AuthResponse> {
		const fullUser = await UserModel.findByUsername(username);

		if (!fullUser) throw new ApiError(404, "User not found");

		const samePassword = await bcrypt.compare(
			password,
			fullUser.hashedPassword
		);

		if (!samePassword) throw new ApiError(409, "Incorrect password");

		const { id, hashedPassword, ...user } = fullUser;

		if (user.isVerified) {
			const tokens = await TokensServices.generateAndStoreTokens(id);

			return {
				isAccountVerified: true,
				userInfo: {
					...tokens,
					user,
				},
			};
		}

		const expiresAt = await OTPServices.generateAndSend(
			user.email,
			OTPPurpose.emailVerification
		);

		return {
			isAccountVerified: false,
			otpInfo: { expiresAt, message: "Please verify your account" },
		};
	}

	static async logout(refreshToken: string) {
		const payload = await TokensServices.decodeToken(refreshToken);
		if (!payload)
			throw new ApiError(
				401,
				"Unauthorized expired refresh token, Log in again"
			);

		await TokensServices.deleteRefreshToken(refreshToken);
		return true;
	}

	static async refreshTokens(oldRefreshToken: string) {
		// Add id property to the payload
		const payload = await TokensServices.decodeToken(oldRefreshToken);

		if (!payload)
			throw new ApiError(
				401,
				"Unauthorized expired refresh token, Log in again"
			);

		await TokensServices.deleteRefreshToken(oldRefreshToken);
		const tokens = await TokensServices.generateAndStoreTokens(payload.userId);

		return tokens;
	}

	static async sendOTP(email: string, purpose: OTPPurpose) {
		// Check if user with such email exists
		if ((await UserModel.findByEmail(email)) === null)
			throw new ApiError(404, `User with the email: ${email} not found`);

		const expiresAt = await OTPServices.generateAndSend(email, purpose);

		return {
			expiresAt,
			message: "We sent you an OTP, Check your mail!",
		};
	}

	static async verifyAccount(
		email: string,
		otp: string
	): Promise<UserVerified> {
		const sameOTP = await OTPServices.verifyOTP(email, otp);
		if (!sameOTP) {
			throw new ApiError(
				500,
				"Sorry we couldn't verify you account, Can you try again later"
			);
		}

		const isVerified = await UserModel.isVerifiedByEmail(email);
		if (isVerified) throw new ApiError(400, "You account already verified!");

		const user = await UserModel.verify(email);

		await OTPModel.cleanUserOTPs(email);

		const tokens = await TokensServices.generateAndStoreTokens(user.id);

		return {
			isAccountVerified: true,
			userInfo: {
				...tokens,
				user,
			},
		};
	}

	static async forgotPassword(email: string) {
		const user = await UserModel.findByEmail(email);
		if (!user) throw new ApiError(404, "User not found");

		const expiresAt = await OTPServices.generateAndSend(
			email,
			OTPPurpose.passwordReset
		);

		return {
			expiresAt,
			message: "We sent you a password reset code, Check your mail!",
		};
	}

	static async changePassword(
		username: string,
		currentPassword: string,
		newPassword: string
	) {
		const isVerified = await UserModel.isVerifiedByUsername(username);
		if (!isVerified) throw new ApiError(400, "Please verify your account");

		const fullUser = await UserModel.findByUsername(username);

		if (!fullUser)
			throw new ApiError(404, "User not found, you can't change such password");

		const sameOldPassword = await bcrypt.compare(
			currentPassword,
			fullUser.hashedPassword
		);

		if (!sameOldPassword)
			throw new ApiError(409, "Wrong password, access denied");

		const sameNewPassword = currentPassword === newPassword;
		if (sameNewPassword)
			throw new ApiError(400, "You can't use the same password");

		const newHashedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUser = await UserModel.updatePassword(
			username,
			newHashedPassword
		);
		if (!updatedUser)
			throw new ApiError(
				400,
				"something went wrong while updating your password"
			);

		return true;
	}

	static async resetPassword(email: string, otp: string, newPassword: string) {
		const sameOTP = await OTPServices.verifyOTP(email, otp);
		if (!sameOTP) throw new ApiError(400, "Invalid or expired OTP");

		const newHashedPassword = await bcrypt.hash(newPassword, 10);

		const user = await UserModel.findByEmail(email);
		if (!user) throw new ApiError(404, "User not found");

		await UserModel.updatePassword(user.username, newHashedPassword);

		// Clean up OTPs
		await OTPModel.cleanUserOTPs(email);

		return { message: "Password reset successfully" };
	}
}
