export enum OTPPurpose {
	emailVerification,
	passwordReset,
	twoStepAuth,
}

export default interface OTPConfigProps {
	purpose: OTPPurpose;
	length: number;
	duration_m: number;
}
