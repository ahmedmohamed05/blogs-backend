import { NextFunction, Request, Response } from "express";
import ApiError from "../utils/apiError";
import { verifyAccessToken, verifyRefreshToken } from "../utils/jwt";

export function verifyAccessCookie(
	req: Request,
	res: Response,
	next: NextFunction
) {
	const { accessToken } = req.cookies || {};
	if (!accessToken)
		throw new ApiError(401, "Access token not found, Access Denied");

	const payload = verifyAccessToken(accessToken);
	if (!payload)
		throw new ApiError(401, "Access token not valid, Generate new one");

	next();
}

export function verifyRefreshCookie(
	req: Request,
	res: Response,
	next: NextFunction
) {
	// Double check cookies
	const { refreshToken } = req.cookies || {};
	if (!refreshToken)
		throw new ApiError(401, "Refresh token not found, Access Denied");

	const payload = verifyRefreshToken(refreshToken);
	if (!payload) throw new ApiError(401, "Refresh token not valid, Login again");

	next();
}
