const cleanMarkdownText = (text) =>
  text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_{1,2}([^_]+)_{1,2}/g, "$1")
    .replace(/^#+\s*/g, "")
    .trim();

export default function ExplainView({ explanation, loading }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-1/3 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-200" />
          <div className="h-4 w-11/12 rounded bg-slate-200" />
          <div className="h-4 w-10/12 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  if (!explanation) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600">
          ✨
        </div>
        Start by asking something ✨
      </div>
    );
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Explanation</h2>
      <div className="space-y-5 text-[15px] leading-8 text-slate-700">
        {explanation
          .split("\n")
          .map((line) => cleanMarkdownText(line))
          .filter(Boolean)
          .map((paragraph, idx) => {
            const isHeading = /:$/.test(paragraph) || paragraph.length < 55;
            return isHeading ? (
              <h3 key={`exp-heading-${idx}`} className="pt-1 text-base font-semibold text-slate-900">
                {paragraph.replace(/:$/, "")}
              </h3>
            ) : (
              <p key={`exp-${idx}`}>{paragraph}</p>
            );
          })}
      </div>
    </article>
  );
}
