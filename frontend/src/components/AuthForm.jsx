import { useState } from "react";

export default function AuthForm({ type, onSubmit, loading }) {
  const isRegister = type === "register";
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isRegister && (
        <input
          className="w-full rounded-lg border border-slate-300 p-3"
          type="text"
          name="name"
          placeholder="Full name"
          value={form.name}
          onChange={handleChange}
          required
        />
      )}
      <input
        className="w-full rounded-lg border border-slate-300 p-3"
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
      />
      <input
        className="w-full rounded-lg border border-slate-300 p-3"
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        required
        minLength={6}
      />
      <button
        className="w-full rounded-lg bg-indigo-600 p-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        type="submit"
        disabled={loading}
      >
        {loading ? "Please wait..." : isRegister ? "Create account" : "Log in"}
      </button>
    </form>
  );
}
