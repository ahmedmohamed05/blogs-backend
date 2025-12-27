import * as z from "zod";
export default class RequestSchemas {
	static register = z.object({
		firstName: z.string().min(1, "First name is required"),
		lastName: z.string().min(1, "Last name is required"),
		email: z.email(),
		username: z.string().min(3, "Username must be at least 3 characters long"),
		password: z.string().min(6, "Password must be at least 6 characters long"),
	});

	static login = z.object({
		username: z.string().min(1, "Username is required"),
		password: z.string().min(1, "Password is required"),
	});

	static refreshCookie = z.object({
		refreshToken: z.string(),
	});

	static accessCookie = z.object({
		accessToken: z.string(),
	});

	static accountVerification = z.object({
		email: z.email(),
		otp: z.string().length(6, "OTP must be 6 digits long"),
	});

	static changePassword = z.object({
		username: z.string().min(1, "Username is required"),
		currentPassword: z
			.string()
			.min(6, "Password must be at least 6 characters long"),
		newPassword: z
			.string()
			.min(6, "Password must be at least 6 characters long"),
	});
}
