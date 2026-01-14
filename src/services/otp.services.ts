import { SendMailOptions } from "nodemailer";
import OTPConfig from "../config/otp";
import OTPModel from "../models/otp.model";
import OTPConfigProps, { OTPPurpose } from "../types/otp.types";
import MailService from "./mail.service";
import {
	generateOTPMailTemplate,
	getMailSubject,
} from "../utils/generate-otp-mail";
import bcrypt from "bcrypt";
import ApiError from "../utils/apiError";

export default class OTPServices {
	private static generateOTP_m(config: OTPConfigProps) {
		let otp = "";

		for (let i = 0; i < config.length; i++) {
			otp += Math.floor(Math.random() * 10).toString();
		}

		const createdAt = Date.now();
		const expiresAt = createdAt + config.duration_m * 60 * 1000;

		return { createdAt, expiresAt, otp };
	}

	private static async generateVerificationOTP_m(email: string) {
		const { expiresAt, otp } = this.generateOTP_m(OTPConfig.EmailVerification);

		// Remove any unused onl OTPs for this email
		await OTPModel.cleanUserOTPs(email);

		const hashedOTP = await bcrypt.hash(otp, 10);

		// Store the new OTP
		await OTPModel.store(hashedOTP, email, expiresAt);

		return { expiresAt, otp };
	}

	private static async compare_m(email: string, otp: string) {
		const rows = await OTPModel.find(email);

		if (rows.length <= 0)
			throw new ApiError(404, "No OTP found, you can request new one");

		const otpRecord = rows[0];

		const sameOTP = await bcrypt.compare(otp, otpRecord.otp);

		if (sameOTP) {
			if (otpRecord.expiresAt < new Date()) {
				throw new ApiError(409, "This OTP is expired, you can request new one");
			}

			return true;
		}

		return false;
	}

	static async generateAndSend(email: string, purpose: OTPPurpose) {
		// TODO: Generate OTP based on the purpose
		const { expiresAt, otp } = await this.generateVerificationOTP_m(email);

		if (process.env.NODE_ENV !== "production") {
			console.log(`[DEV ONLY] OTP for ${email}: ${otp}`);
		}

		const expiresAtMinutes = Math.ceil((expiresAt - Date.now()) / 1000 / 60);

		const mailOptions: SendMailOptions = {
			from: "Teachme",
			to: email,
			subject: getMailSubject(purpose),
			html: generateOTPMailTemplate(purpose, email, otp, expiresAtMinutes),
		};

		const mailResponse = await MailService.sendMail(mailOptions);

		return expiresAt;
	}

	static async verifyOTP(email: string, otp: string) {
		const sameOTP = await OTPServices.compare_m(email, otp);

		if (!sameOTP) throw new ApiError(409, "Wrong OTP, try again");

		return true;
	}
}
