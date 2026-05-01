import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const SummaryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[18px] w-[18px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 3v5h5M9 13h6M9 17h6M9 9h2" />
  </svg>
);

const ExplainIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[18px] w-[18px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6.5A2.5 2.5 0 016.5 4H11v14H6.5A2.5 2.5 0 004 20.5v-14zM20 6.5A2.5 2.5 0 0017.5 4H13v14h4.5A2.5 2.5 0 0120 20.5v-14z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 9.5h.01M14.5 9.5h.01M11.5 12.5h1" />
  </svg>
);

const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[18px] w-[18px]">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.5a8.5 8.5 0 01-13.9 6.7L3 19l.8-4.1A8.5 8.5 0 1112.5 20" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 10.5h7M8.5 13.5h4.5" />
  </svg>
);

export default function LandingPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (token || storedUser) {
      navigate("/dashboard", { replace: true });
      return;
    }
    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [token, storedUser, navigate]);

  const handleStartFree = () => {
    navigate(token || storedUser ? "/dashboard" : "/register");
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-violet-50 via-white to-slate-50">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-8 md:py-5">
        <div className="flex items-center gap-2.5 md:gap-3">
          <img
            src="/branding/icon-app.png"
            alt="StudyGenie icon"
            className="h-9 w-9 rounded-xl shadow-sm md:h-10 md:w-10"
          />
          <span className="text-xl font-bold text-slate-900 md:text-2xl">StudyGenie</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            aria-label="Go to login page"
            className="rounded-lg border border-violet-200 px-3 py-2 text-sm font-medium text-violet-700 transition-all hover:scale-[1.02] hover:bg-violet-50 hover:shadow-sm active:scale-95 md:px-4"
          >
            Login
          </Link>
          <button
            type="button"
            role="button"
            aria-label="Start studying for free"
            onClick={handleStartFree}
            className="rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white transition-all hover:scale-[1.02] hover:bg-violet-700 hover:shadow-sm active:scale-95 md:px-4"
          >
            Get Started
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-12 pt-6 md:px-8 md:pb-16 md:pt-12">
        <section
          className={`mx-auto max-w-3xl text-center transition-all duration-500 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          <h1 className="mx-auto max-w-4xl text-2xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Learn Faster With AI-Powered Study Workflows
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-slate-600 md:mt-4 md:text-lg">
            Summarize notes, generate quizzes, get simple explanations, and chat with your
            material in one focused workspace.
          </p>
          <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:mt-8 sm:flex-row sm:items-center">
            <button
              type="button"
              role="button"
              aria-label="Start studying for free"
              onClick={handleStartFree}
              className="w-full rounded-xl bg-violet-600 px-6 py-3 text-center font-semibold text-white shadow-sm transition-all hover:scale-[1.02] hover:bg-violet-700 hover:shadow-md active:scale-95 focus:outline-none focus:ring-2 focus:ring-violet-300 sm:w-auto sm:min-w-[220px]"
            >
              🚀 Start Studying for Free
            </button>
            <Link
              to="/login"
              role="button"
              aria-label="Go to login page"
              className="w-full rounded-xl border border-slate-300 px-6 py-3 text-center font-semibold text-slate-700 transition-all hover:scale-[1.02] hover:bg-slate-50 hover:shadow-sm active:scale-95 focus:outline-none focus:ring-2 focus:ring-violet-300 sm:w-auto sm:min-w-[250px]"
            >
              I already have an account
            </Link>
          </div>
        </section>

        <section
          className={`mt-12 grid gap-4 sm:mt-14 md:grid-cols-2 lg:mt-16 lg:grid-cols-4 transition-all duration-500 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          {[
            {
              title: "Summary",
              desc: "Turn dense notes into concise key points instantly.",
              Icon: SummaryIcon,
            },
            {
              title: "Quiz",
              desc: "Practice with interactive quizzes and track your progress in real time.",
              iconSrc: "/branding/brain.png",
            },
            {
              title: "Explain",
              desc: "Break down hard topics into simple, easy-to-understand explanations.",
              iconSrc: "/branding/presentation.png",
            },
            {
              title: "Chat",
              desc: "Ask follow-up questions and learn in a natural conversation.",
              Icon: ChatIcon,
            },
          ].map((feature, index) => (
            <article
              key={feature.title}
              style={{ transitionDelay: `${index * 90}ms` }}
              className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
              }`}
            >
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 ring-1 ring-violet-200">
                {feature.iconSrc ? (
                  <img src={feature.iconSrc} alt={`${feature.title} icon`} className="h-[18px] w-[18px]" />
                ) : (
                  <feature.Icon />
                )}
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{feature.desc}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
