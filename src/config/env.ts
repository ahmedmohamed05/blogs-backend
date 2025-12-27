import "dotenv/config";
import { exit } from "node:process";

//TODO add a check logic for environment variables

const keys = [
	"PORT",
	"JWT_ACCESS_SECRET",
	"JWT_REFRESH_SECRET",
	"NODE_ENV",
	"AUTH_EMAIL",
	"AUTH_PASSWORD",
	"OTP_SECRET",
];

const undefinedVariables = keys
	.filter((key) => process.env[key] === undefined)
	.join(",");

if (undefinedVariables.length > 0) {
	console.log("Undefined Environment variables: ", undefinedVariables);
	exit(1);
}

const env = {
	port: process.env.PORT!,
	jwtAccessSecret: process.env.JWT_ACCESS_SECRET!,
	jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
	nodeEnv: process.env.NODE_ENV!,
	emailAuth: process.env.AUTH_EMAIL!,
	passwordAuth: process.env.AUTH_PASSWORD!,
	otpSecret: process.env.OTP_SECRET!,
};

export default env;
