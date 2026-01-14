import prisma from "../lib/prisma";

export default class ValidRefreshTokenModel {
	static async store(token: string, userId: number) {
		const newRecord = await prisma.validRefreshToken.create({
			data: {
				token,
				userId,
			},
			include: { user: true },
		});

		return newRecord;
	}

	static async delete(token: string) {
		const record = await prisma.validRefreshToken.delete({
			where: { token },
		});
		return record;
	}

	static async find(token: string) {
		const record = await prisma.validRefreshToken.findUnique({
			where: { token },
		});
		return record;
	}

	static async deleteAllTokens(userId: number) {}
}
