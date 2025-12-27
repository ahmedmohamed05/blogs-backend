import { NextFunction, Request, Response } from "express";
import ApiError from "../utils/apiError";

export default function errorHandler(
	err: any,
	req: Request,
	res: Response,
	next: NextFunction
) {
	if (res.headersSent) return next(err);

	console.log(err);

	if (err instanceof ApiError) {
		return res.status(err.status).json({
			status: err.status,
			message: err.message,
		});
	}

	res.status(500).json({
		status: 500,
		message: "Internal Server Error",
	});
}
