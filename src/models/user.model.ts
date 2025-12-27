import prisma from "../lib/prisma";
import { UserInclude } from "../generated/prisma/models";

// All possible includes expect for "validRefreshTokens"
type UserIncludes = Omit<UserInclude, "validRefreshTokens">;

export default class UserModel {
	static async create(
		firstName: string,
		lastName: string,
		email: string,
		username: string,
		hashedPassword: string
	) {
		const newUser = await prisma.user.create({
			data: {
				username,
				hashedPassword,
				firstName,
				lastName,
				email,
			},
		});
		return newUser;
	}

	static async findByUsername(username: string, include?: UserIncludes) {
		const user = prisma.user.findFirst({
			where: { username },
			include: { ...include },
		});

		return user;
	}

	static async findByEmail(email: string, include?: UserIncludes) {
		const user = prisma.user.findFirst({
			where: { email },
			include: { ...include },
		});

		return user;
	}

	static async delete(username: string) {
		const deletedUser = prisma.user.delete({ where: { username } });
		return deletedUser;
	}

	static async verify(email: string) {
		const user = await prisma.user.update({
			data: {
				isVerified: true,
			},
			where: {
				email,
			},
		});

		return user;
	}

	static async isVerifiedByEmail(email: string) {
		const user = await this.findByEmail(email);

		if (!user) return null;

		return user.isVerified;
	}

	static async isVerifiedByUsername(username: string) {
		const user = await this.findByUsername(username);

		if (!user) return null;

		return user.isVerified;
	}

	static async updatePassword(username: string, newPassword: string) {
		const user = await prisma.user.update({
			data: {
				hashedPassword: newPassword,
			},
			where: {
				username,
			},
		});

		return user;
	}
}
