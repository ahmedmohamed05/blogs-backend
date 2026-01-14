import jwt from "jsonwebtoken";
import env from "../config/env";
import jwtConfig from "../config/jwt";

export function generateTokens(userId: number) {
	try {
		const accessToken = jwt.sign({ userId }, env.jwtAccessSecret, {
			expiresIn: jwtConfig.accessTokenExpiry,
		});

		const refreshToken = jwt.sign({ userId }, env.jwtRefreshSecret, {
			expiresIn: jwtConfig.refreshTokenExpiry,
		});

		return { accessToken, refreshToken };
	} catch (err) {
		throw new Error(err as string);
	}
}

export function verifyAccessToken(token: string) {
	try {
		return jwt.verify(token, env.jwtAccessSecret);
	} catch (error) {
		return null;
	}
}

export function verifyRefreshToken(token: string) {
	try {
		const payload = jwt.verify(token, env.jwtRefreshSecret);
		return payload;
	} catch (error) {
		return null;
	}
}
