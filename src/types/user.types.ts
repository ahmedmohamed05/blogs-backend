import { User } from "../generated/prisma/client";
import { UserInclude } from "../generated/prisma/models";

export type UserJWT = User &
	Omit<UserInclude, "validRefreshTokens" | "_count"> & {
		iat?: number;
		exp?: number;
	};
