const readline = require("readline");

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const askQuestion = (query) =>
	new Promise((resolve) => rl.question(query, resolve));

const BASE_URL = "http://localhost:8080/api/auth";

async function testAuth() {
	console.log("Starting Auth Verification...");

	const testWeak = {
		firstName: "Test",
		lastName: "User",
		email: "mom1232344@gmail.com",
		username: "testweak",
		password: "weak",
	};

	// 1. Weak Password Registration
	try {
		const res = await fetch(`${BASE_URL}/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(testWeak),
		});
		if (res.status === 400) console.log("✅ Weak password rejected");
		else console.log("❌ Weak password check failed", res.status);
	} catch (e) {
		if (e.code === "ECONNREFUSED")
			console.error(
				"Error: Connection refused. Is server running on port 8080?"
			);
		else console.error("Error testing weak password:", e);
	}

	// 2. Strong Password Registration
	const uniqueUser = `user${Date.now()}`;
	const email = testWeak.email;
	try {
		const res = await fetch(`${BASE_URL}/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				firstName: "Test",
				lastName: "User",
				email: email,
				username: uniqueUser,
				password: "StrongPassword1!",
			}),
		});
		if (res.status === 200) console.log("✅ Strong password registered");
		else {
			const txt = await res.text();
			console.log("❌ Strong password registration failed", res.status, txt);
		}
	} catch (e) {
		console.error("Error testing registration:", e);
	}

	// 3. Verify Account
	try {
		const otp = await askQuestion(
			"👉 Enter the OPT sent to console/email for Account Verification: "
		);
		const res = await fetch(`${BASE_URL}/verify-account`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email,
				otp: otp.trim(),
			}),
		});
		const txt = await res.text();
		if (res.status === 200) console.log("✅ Account Verified successfully");
		else console.log("❌ Account Verification failed", res.status, txt);
	} catch (e) {
		console.error("Error testing verify account:", e);
	}

	// 4. Login (Check if verified)
	try {
		const res = await fetch(`${BASE_URL}/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				username: uniqueUser,
				password: "StrongPassword1!",
			}),
		});
		if (res.status === 200) console.log("✅ Login successful");
		else console.log("❌ Login failed", res.status);
	} catch (e) {
		console.error("Error testing login:", e);
	}

	// 5. Forgot Password
	try {
		const res = await fetch(`${BASE_URL}/forgot-password`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email }),
		});
		if (res.status === 200) console.log("✅ Forgot password flow initiated");
		else console.log("❌ Forgot password failed", res.status);
	} catch (e) {
		console.error("Error testing forgot password:", e);
	}

	// 6. Send OTP
	try {
		const res = await fetch(`${BASE_URL}/send-otp`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, purpose: "emailVerification" }),
		});
		if (res.status === 200) console.log("✅ Send OTP success");
		else console.log("❌ Send OTP failed", res.status);
	} catch (e) {
		console.error("Error testing send OTP:", e);
	}

	// 7. Reset Password
	try {
		const otp = await askQuestion(
			"👉 Enter the OTP sent to console/email for Password Reset: "
		);

		const res = await fetch(`${BASE_URL}/reset-password`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email,
				otp: otp.trim(),
				newPassword: "NewStrongPassword1!",
			}),
		});
		const txt = await res.text();
		if (res.status === 200) console.log("✅ Password reset successfully");
		else console.log("❌ Reset password failed", res.status, txt);
	} catch (e) {
		console.error("Error testing reset password:", e);
	}

	// 8. Login with New Password
	try {
		const res = await fetch(`${BASE_URL}/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				username: uniqueUser,
				password: "NewStrongPassword1!",
			}),
		});
		if (res.status === 200)
			console.log("✅ Login with new password successful");
		else console.log("❌ Login with new password failed", res.status);
	} catch (e) {
		console.error("Error testing login with new password:", e);
	}

	rl.close();
}

testAuth();
