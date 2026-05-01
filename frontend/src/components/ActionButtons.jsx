const actions = [
  { key: "summary", label: "Summary" },
  { key: "quiz", label: "Quiz" },
  { key: "explain", label: "Explain" },
  { key: "chat", label: "Chat" },
];

export default function ActionButtons({ loadingAction, onAction }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {actions.map((action) => {
        const isLoading = loadingAction === action.key;
        const isPrimary = action.key === "summary";

        return (
          <button
            key={action.key}
            type="button"
            onClick={() => onAction(action.key)}
            disabled={!!loadingAction}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
              isPrimary
                ? "bg-violet-600 text-white shadow-md shadow-violet-200 hover:scale-105 hover:bg-violet-700 hover:shadow-lg"
                : "border border-violet-200 bg-white text-violet-700 hover:scale-105 hover:border-violet-300 hover:bg-violet-50 hover:shadow-md"
            }`}
          >
            {isLoading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {isLoading ? "Generating..." : action.label}
          </button>
        );
      })}
    </div>
  );
}
