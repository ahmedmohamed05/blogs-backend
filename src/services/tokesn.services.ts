import { JwtPayload } from "jsonwebtoken";
import ValidRefreshTokenModel from "../models/validRefreshToken.model";
import Tokens from "../types/tokens.types";
import { generateTokens, verifyRefreshToken } from "../utils/jwt";

export default class TokensServices {
	static async generateAndStoreTokens(userId: number): Promise<Tokens> {
		const tokens = generateTokens(userId);
		await ValidRefreshTokenModel.store(tokens.refreshToken, userId);
		return tokens;
	}

	static async deleteRefreshToken(refreshToken: string): Promise<void> {
		await ValidRefreshTokenModel.delete(refreshToken);
	}

	static async checkToken(refreshToken: string): Promise<boolean> {
		return (await ValidRefreshTokenModel.find(refreshToken)) !== null;
	}

	static async decodeToken(
		refreshToken: string
	): Promise<JwtPayload & { userId: number }> {
		const ret = verifyRefreshToken(refreshToken);
		if (!ret) throw new Error("Invalid refresh token");
		const decoded = ret as JwtPayload & { userId: number };
		return decoded;
	}
}
