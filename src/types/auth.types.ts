import { User } from "../generated/prisma/client";

export interface UserVerified {
	isAccountVerified: true;
	userInfo: {
		user: Omit<User, "hashedPassword" | "id">;
		accessToken: string;
		refreshToken: string;
	};
}

export interface UserNotVerified {
	isAccountVerified: false;
	otpInfo: {
		expiresAt: number;
		message: string;
	};
}

export type AuthResponse = UserVerified | UserNotVerified;
