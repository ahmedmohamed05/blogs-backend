import nodemailer, { Transporter } from "nodemailer";
import { SendMailOptions } from "nodemailer";
import env from "../config/env";
import ApiError from "../utils/apiError";

export default class MailService {
	private static transporter_m: Transporter;

	static {
		MailService.transporter_m = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: env.emailAuth,
				pass: env.passwordAuth,
			},
		});

		MailService.transporter_m.verify((err) => {
			if (err) {
				throw new ApiError(500, "Error with mail service");
			}
		});
	}

	static async sendMail(options: SendMailOptions) {
		return await this.transporter_m.sendMail(options);
	}
}
