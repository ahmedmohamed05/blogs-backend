import { NextFunction, Request, Response } from "express";
import ApiError from "../utils/apiError";
import * as z from "zod";

const validateRequestSchema =
	(schema: z.ZodSchema, key?: keyof Request) =>
	(req: Request, res: Response, next: NextFunction) => {
		const result = schema.safeParse(key !== undefined ? req[key] : req.body);

		if (!result.success) {
			const messages = result.error.issues
				.map((issue) => {
					return `${issue.path}: ${issue.message}`;
				})
				.join(",");

			throw new ApiError(400, messages);
		}

		next();
	};

export default validateRequestSchema;
