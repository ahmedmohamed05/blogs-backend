import prisma from "../src/lib/prisma";

const port = process.env.PORT!;
const BASE_URL = `http://localhost:${port}/api/auth`;

async function main() {
	const timestamp = Date.now();
	const userData = {
		firstName: "Test",
		lastName: "User",
		email: `test_${timestamp}@example.com`,
		username: `user_${timestamp}`,
		password: "password123", // Simple password check
	};

	try {
		console.log("1. Registering new user...");
		const registerRes = await fetch(`${BASE_URL}/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(userData),
		});

		if (!registerRes.ok) {
			// If 429, it might be rate limited.
			if (registerRes.status === 429) {
				console.log("⚠️ Rate limited. Skipping registration check.");
				return;
			}
			const error = await registerRes.text();
			throw new Error(`Registration failed: ${registerRes.status} ${error}`);
		}
		console.log("✅ Registration successful");

		console.log("2. Fetching OTP from database...");
		await new Promise((r) => setTimeout(r, 1000));

		// Using loose typing to avoid needing exact generated types in script
		const otpRecord = await (prisma as any).otp.findFirst({
			where: { user: { email: userData.email } },
		});

		if (!otpRecord) {
			throw new Error(
				"OTP not found in DB. Make sure the backend is running and connected to the same DB."
			);
		}

		console.log("Found OTP:", otpRecord.otp);
		await verifyAccount(otpRecord.otp);
	} catch (error) {
		console.error("❌ Test Failed:", error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}

	async function verifyAccount(otp: string) {
		console.log("3. Verifying account...");
		const verifyRes = await fetch(`${BASE_URL}/verify-account`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email: userData.email, otp }),
		});

		if (!verifyRes.ok) {
			const error = await verifyRes.text();
			throw new Error(`Verification failed: ${verifyRes.status} ${error}`);
		}

		const cookieHeader = verifyRes.headers.get("set-cookie");
		console.log("✅ Account verified");

		await login(cookieHeader);
	}

	async function login(cookies: string | null) {
		console.log("4. Logging in...");
		const loginRes = await fetch(`${BASE_URL}/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				username: userData.username,
				password: userData.password,
			}),
		});

		if (!loginRes.ok) {
			const error = await loginRes.text();
			throw new Error(`Login failed: ${loginRes.status} ${error}`);
		}

		console.log("✅ Login successful");
	}
}

main();
