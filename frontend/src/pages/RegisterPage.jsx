import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { registerUser } from "../api/auth";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async ({ name, email, password }) => {
    setError("");
    setLoading(true);
    try {
      const data = await registerUser({ name, email, password });
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userId", data.user.id);
      navigate("/dashboard");
    } catch (err) {
      const serverMessage = err?.response?.data?.message;
      const fallbackMessage = err?.response
        ? "Registration failed. Please try again."
        : "Cannot reach server. Please try again.";
      setError(serverMessage || fallbackMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-lg md:p-8">
        <img
          src="/branding/logo.png"
          alt="StudyGenie logo"
          className="mx-auto mb-5 w-full max-w-xs object-contain"
        />
        <h1 className="mb-1 text-center text-3xl font-bold text-slate-900">Create your account</h1>
        <p className="mb-6 text-center text-sm text-slate-600">
          Start learning smarter with StudyGenie.
        </p>
        {error && <p className="mb-3 rounded bg-red-100 p-2 text-sm text-red-700">{error}</p>}
        <AuthForm type="register" onSubmit={handleRegister} loading={loading} />
        <p className="mt-5 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="font-medium text-indigo-700" to="/login">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
