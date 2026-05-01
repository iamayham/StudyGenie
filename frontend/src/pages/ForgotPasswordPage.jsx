import { useState } from "react";
import { Link } from "react-router-dom";
import { resetPasswordWithOtp, sendForgotPasswordOtp } from "../api/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("requestOtp");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const data = await sendForgotPasswordOtp({ email });
      setMessage(data.message);
      setStep("verifyOtp");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const data = await resetPasswordWithOtp({
        email,
        otp,
        newPassword,
      });
      setMessage(data.message);
      setStep("done");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-lg md:p-8">
        <img
          src="/branding/logo.png"
          alt="StudyGenie logo"
          className="mx-auto mb-5 w-full max-w-xs object-contain"
        />
        <h1 className="mb-1 text-center text-2xl font-bold text-slate-900">Forgot password?</h1>
        <p className="mb-6 text-center text-sm text-slate-600">
          Enter your email and we will send a one-time OTP code.
        </p>

        {step === "done" ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {message}
          </div>
        ) : step === "verifyOtp" ? (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              If an account exists for <span className="font-semibold">{email}</span>, an OTP code
              has been sent.
            </div>
            <input
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit OTP"
              className="w-full rounded-lg border border-slate-300 p-3"
            />
            <input
              type="password"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full rounded-lg border border-slate-300 p-3"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 p-3 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Verify OTP & Reset Password"}
            </button>
            <button
              type="button"
              onClick={() => setStep("requestOtp")}
              className="w-full rounded-lg border border-slate-300 p-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Use different email
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-lg border border-slate-300 p-3"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 p-3 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        )}

        {error && <p className="mt-3 rounded bg-red-100 p-2 text-sm text-red-700">{error}</p>}

        <p className="mt-5 text-center text-sm text-slate-600">
          Remember your password?{" "}
          <Link className="font-medium text-indigo-700" to="/login">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
