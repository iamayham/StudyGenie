import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { loginUser } from "../api/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async ({ email, password }) => {
    setError("");
    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userId", data.user.id);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
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
        <h1 className="mb-1 text-center text-3xl font-bold text-slate-900">Welcome back</h1>
        <p className="mb-6 text-center text-sm text-slate-600">
          Log in to continue using StudyGenie.
        </p>
        {error && <p className="mb-3 rounded bg-red-100 p-2 text-sm text-red-700">{error}</p>}
        <AuthForm type="login" onSubmit={handleLogin} loading={loading} />
        <p className="mt-3 text-right text-sm">
          <Link className="font-medium text-indigo-700 hover:text-indigo-800" to="/forgot-password">
            Forgot password?
          </Link>
        </p>
        <p className="mt-5 text-center text-sm text-slate-600">
          New here?{" "}
          <Link className="font-medium text-indigo-700" to="/register">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
