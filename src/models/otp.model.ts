import prisma from "../lib/prisma";

export default class OTPModel {
	static async store(otp: string, email: string, expiresAt: number) {
		const otpRecord = await prisma.otp.create({
			data: {
				otp,
				expiresAt: new Date(expiresAt),
				user: {
					connect: {
						email,
					},
				},
			},
			include: { user: true },
		});

		return otpRecord;
	}

	static async find(email: string) {
		const otp = await prisma.otp.findMany({
			where: {
				user: { email },
			},
		});

		return otp;
	}

	static async cleanUserOTPs(email: string) {
		const expired = await prisma.otp.deleteMany({
			where: {
				user: {
					email,
				},
				// OR: {
				//   expiresAt: { lt: new Date().toISOString() },
				// }
			},
		});
	}
}
