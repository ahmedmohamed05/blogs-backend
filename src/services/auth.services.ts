import UserModel from "../models/user.model";
import ApiError from "../utils/apiError";
import bcrypt from "bcrypt";
import { generateTokens, verifyRefreshToken } from "../utils/jwt";
import ValidRefreshTokenModel from "../models/validRefreshToken.model";
import { JwtPayload } from "jsonwebtoken";
import OTPServices from "./otp.services";
import { User } from "../generated/prisma/client";
import OTPModel from "../models/otp.model";
import { OTPPurpose } from "../types/otp.types";

interface UserVerified {
	isAccountVerified: true;
	userInfo: {
		user: Omit<User, "hashedPassword" | "id">;
		accessToken: string;
		refreshToken: string;
	};
}

interface UserNotVerified {
	isAccountVerified: false;
	otpInfo: {
		expiresAt: number;
		message: string;
	};
}

type AuthResponse = UserVerified | UserNotVerified;

export default class AuthServices {
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
			const { accessToken, refreshToken } = generateTokens(fullUser.id);
			await ValidRefreshTokenModel.store(refreshToken, fullUser.id);

			return {
				isAccountVerified: true,
				userInfo: {
					accessToken,
					refreshToken,
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
		const ret = verifyRefreshToken(refreshToken);
		if (ret) await ValidRefreshTokenModel.delete(refreshToken);
		return ret;
	}

	static async refreshTokens(oldRefreshToken: string) {
		// Add id property to the payload
		const payload = verifyRefreshToken(oldRefreshToken) as JwtPayload & {
			userId: number;
		};

		if (!payload)
			throw new ApiError(
				401,
				"Unauthorized expired refresh token, Log in again"
			);

		// Find and delete the old token from database
		const oldDBToken = await ValidRefreshTokenModel.find(oldRefreshToken);

		if (!oldDBToken)
			throw new ApiError(401, "Invalid refresh token, Log in again");

		ValidRefreshTokenModel.delete(oldRefreshToken);

		const { accessToken, refreshToken } = generateTokens(payload.userId);
		await ValidRefreshTokenModel.store(refreshToken, payload.userId);

		return { accessToken, refreshToken };
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

	static async verifyOTP(email: string, otp: string) {
		const sameOTP = await OTPServices.verifyOTP(email, otp);
		if (!sameOTP) {
			throw new ApiError(
				500,
				"Sorry we couldn't verify you account, Can you try again later"
			);
		}

		if (await UserModel.isVerifiedByEmail(email))
			throw new ApiError(400, "You account already verified!");

		const user = await UserModel.verify(email);

		await OTPModel.cleanUserOTPs(email);

		const { accessToken, refreshToken } = generateTokens(user.id);
		await ValidRefreshTokenModel.store(refreshToken, user.id);

		return {
			isAccountVerified: true,
			userData: {
				accessToken,
				refreshToken,
				user,
			},
		};
	}

	static async changePassword(
		username: string,
		currentPassword: string,
		newPassword: string
	): Promise<UserVerified> {
		const user = await UserModel.findByUsername(username);

		if (!user)
			throw new ApiError(404, "User not found, you can't change such password");

		const sameOldPassword = await bcrypt.compare(
			currentPassword,
			user.hashedPassword
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
				"something wen't wrong while updating your password"
			);

		const { id, hashedPassword, ...safeUser } = updatedUser;

		const { accessToken, refreshToken } = generateTokens(updatedUser.id);
		await ValidRefreshTokenModel.store(refreshToken, updatedUser.id);

		return {
			isAccountVerified: true,
			userInfo: {
				accessToken,
				refreshToken,
				user,
			},
		};
	}
}
