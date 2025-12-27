import OTP, { OTPPurpose } from "../types/otp.types";

export default class OTPConfig {
	static EmailVerification: OTP = {
		purpose: OTPPurpose.emailVerification,
		length: 6,
		duration_m: 10,
	} as const;

	static passwordReset: OTP = {
		purpose: OTPPurpose.passwordReset,
		length: 6,
		duration_m: 10,
	} as const;

	static twoStepAuth: OTP = {
		purpose: OTPPurpose.twoStepAuth,
		length: 6,
		duration_m: 5,
	} as const;
}
