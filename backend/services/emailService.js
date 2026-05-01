const nodemailer = require("nodemailer");
const { Resend } = require("resend");

let cachedTransporter;
let cachedResendClient;
const EMAIL_SEND_TIMEOUT_MS = 12000;
const OTP_SUBJECT = "StudyGenie Password Reset OTP";

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
    connectionTimeout: EMAIL_SEND_TIMEOUT_MS,
    greetingTimeout: EMAIL_SEND_TIMEOUT_MS,
    socketTimeout: EMAIL_SEND_TIMEOUT_MS,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return cachedTransporter;
};

const getResendClient = () => {
  const { RESEND_API_KEY } = process.env;
  if (!RESEND_API_KEY) return null;

  if (!cachedResendClient) {
    cachedResendClient = new Resend(RESEND_API_KEY);
  }

  return cachedResendClient;
};

const sendOtpEmail = async ({ to, otp }) => {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!from) {
    throw new Error("Email sender is not configured. Set SMTP_FROM or SMTP_USER.");
  }

  const resendClient = getResendClient();
  const message = buildOtpMessage(otp);

  if (resendClient) {
    const resendPromise = resendClient.emails.send({
      from,
      to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Resend send timeout")), EMAIL_SEND_TIMEOUT_MS);
    });

    await Promise.race([resendPromise, timeoutPromise]);
    return;
  }

  const transporter = await getTransporter();
  const mailPromise = transporter.sendMail({
    from,
    to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("SMTP send timeout")), EMAIL_SEND_TIMEOUT_MS);
  });

  await Promise.race([mailPromise, timeoutPromise]);
};

module.exports = {
  sendOtpEmail,
};
