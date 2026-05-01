const nodemailer = require("nodemailer");

let cachedTransporter;

const getTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      "SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in backend/.env."
    );
  }

  cachedTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return cachedTransporter;
};

const sendOtpEmail = async ({ to, otp }) => {
  const transporter = await getTransporter();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to,
    subject: "StudyGenie Password Reset OTP",
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
};

module.exports = {
  sendOtpEmail,
};
