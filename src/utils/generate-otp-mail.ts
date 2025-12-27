import { OTPPurpose } from "../types/otp.types";

export function generateOTPMailTemplate(
	purpose: OTPPurpose,
	username: string,
	otp: string,
	expiresAtMinutes: number
) {
	return getMailTemplate(
		getMailSubject(purpose),
		username,
		otp,
		expiresAtMinutes
	);
}

export function getMailSubject(purpose: OTPPurpose) {
	switch (purpose) {
		case OTPPurpose.emailVerification:
			return "Verify Your Email Address";
		case OTPPurpose.passwordReset:
			return "Reset Your Password";
		case OTPPurpose.twoStepAuth:
			return "Your Two-Factor Authentication Code";
		default:
			return "Your Verification Code";
	}
}

function getMailTemplate(
	subject: string,
	username: string,
	otpCode: string,
	expiresAtMinutes: number
): string {
	return ` 
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .content {
              background-color: white;
              padding: 30px;
              border-radius: 5px;
            }
            .otp-code {
              font-size: 32px;
              font-weight: bold;
              color: #4CAF50;
              text-align: center;
              padding: 20px;
              background-color: #f9f9f9;
              border-radius: 5px;
              letter-spacing: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
            .warning {
              color: #ff5722;
              font-size: 14px;
              margin-top: 15px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <h2>Hello ${username}!</h2>
              <h3>${subject}</h3>

              <p>Your verification code is:</p>
              
              <div class="otp-code">${otpCode}</div>
              
              <p>This code will expire in <strong>${expiresAtMinutes} minutes</strong>.</p>
              
              <p class="warning">
                ⚠️ Do not share this code with anyone. Our team will never ask for this code.
              </p>
              
              <p>If you didn't request this code, please ignore this email.</p>
              
              <div class="footer">
                <p>This is an automated email. Please do not reply.</p>
                <p>&copy; ${new Date().getFullYear()} Teachme. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
}
