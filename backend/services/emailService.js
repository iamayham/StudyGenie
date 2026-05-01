const { Resend } = require("resend");

let cachedResendClient;
const EMAIL_SEND_TIMEOUT_MS = 12000;
const OTP_SUBJECT = "StudyGenie Password Reset OTP";
const DEFAULT_FROM_EMAIL = "StudyGenie <noreply@studygenie.site>";

const buildOtpMessage = (otp) => ({
  subject: OTP_SUBJECT,
  text: `Your StudyGenie OTP code is: ${otp}. It expires in 10 minutes.`,
  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1f2937;">
      <h2 style="margin-bottom: 8px;">StudyGenie Password Reset</h2>
      <p>Your OTP code is:</p>
      <p style="font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #4f46e5;">${otp}</p>
      <p>This code expires in 10 minutes.</p>
    </div>
  `,
});

const getResendClient = () => {
  const { RESEND_API_KEY } = process.env;
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is missing. Set it in backend/.env.");
  }

  if (!cachedResendClient) {
    cachedResendClient = new Resend(RESEND_API_KEY);
  }

  return cachedResendClient;
};

const sendOtpEmail = async ({ to, otp }) => {
  const resendClient = getResendClient();
  const message = buildOtpMessage(otp);
  const resendPromise = resendClient.emails.send({
    from: DEFAULT_FROM_EMAIL,
    to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("Resend send timeout")), EMAIL_SEND_TIMEOUT_MS);
  });

  await Promise.race([resendPromise, timeoutPromise]);
};

module.exports = {
  sendOtpEmail,
};
