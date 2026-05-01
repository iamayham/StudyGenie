import { useEffect, useState } from "react";

export default function QuizView({ questions, loading }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setScore(0);
  }, [questions]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((item) => (
          <div key={item} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
            <div className="animate-pulse space-y-3">
              <div className="h-5 w-2/3 rounded bg-slate-200" />
              <div className="h-10 w-full rounded bg-slate-200" />
              <div className="h-10 w-full rounded bg-slate-200" />
              <div className="h-10 w-full rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600">
          ✨
        </div>
        Start by asking something ✨
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const normalizedOptions = (() => {
    const safeOptions = Array.isArray(currentQuestion.options) ? currentQuestion.options.slice(0, 4) : [];
    while (safeOptions.length < 4) {
      safeOptions.push(`Option ${String.fromCharCode(65 + safeOptions.length)}`);
    }
    return safeOptions;
  })();
  const normalizedCorrectIndex =
    currentQuestion.correctIndex >= 0 && currentQuestion.correctIndex < 4 ? currentQuestion.correctIndex : 0;
  const selectedIndex = selectedAnswers[currentQuestion.id];
  const hasSelected = selectedIndex !== undefined;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleSelect = (optionIndex) => {
    if (hasSelected) return;

    setSelectedAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionIndex }));
    if (optionIndex === normalizedCorrectIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (!hasSelected || isLastQuestion) return;
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handleRestart = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setScore(0);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Quiz Challenge</h2>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
              Question {currentQuestionIndex + 1} / {questions.length}
            </span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Score: {score}
            </span>
          </div>
        </div>

        <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-violet-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mb-4 text-base font-semibold text-slate-900">{currentQuestion.question}</p>

        <div className="space-y-2">
          {normalizedOptions.map((option, optionIndex) => {
            const isSelected = selectedIndex === optionIndex;
            const isCorrect = normalizedCorrectIndex === optionIndex;
            const showCorrect = hasSelected && isCorrect;
            const showWrong = hasSelected && isSelected && !isCorrect;

            return (
              <button
                key={`${currentQuestion.id}-opt-${optionIndex}`}
                type="button"
                onClick={() => handleSelect(optionIndex)}
                disabled={hasSelected}
                className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${
                  showCorrect
                    ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                    : showWrong
                      ? "border-rose-300 bg-rose-50 text-rose-700"
                      : isSelected
                        ? "border-violet-300 bg-violet-50 text-violet-700"
                        : "border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:bg-violet-50"
                } ${hasSelected ? "cursor-not-allowed" : ""}`}
              >
                {option}
              </button>
            );
          })}
        </div>

        {hasSelected && (
          <div className="mt-4 space-y-1">
            <p
              className={`text-sm font-semibold ${
                selectedIndex === normalizedCorrectIndex ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {selectedIndex === normalizedCorrectIndex
                ? "Correct!"
                : `Incorrect — correct answer is: ${normalizedOptions[normalizedCorrectIndex]}`}
            </p>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          {!isLastQuestion ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!hasSelected}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next Question
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium text-slate-700">
                Quiz complete. Final score:{" "}
                <span className="text-violet-700">
                  {score}/{questions.length}
                </span>
              </p>
              <button
                type="button"
                onClick={handleRestart}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
              >
                Restart Quiz
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
