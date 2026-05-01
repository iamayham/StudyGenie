const cleanMarkdownText = (text) =>
  text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_{1,2}([^_]+)_{1,2}/g, "$1")
    .replace(/^#+\s*/g, "")
    .trim();

function renderSummary(summary) {
  const lines = summary
    .split("\n")
    .map((line) => cleanMarkdownText(line.trim()))
    .filter(Boolean);
  const blocks = [];
  let bulletBuffer = [];
  let activeSection = "";

  const flushBullets = () => {
    if (!bulletBuffer.length) return;
    const isKeyTakeaway = activeSection.toLowerCase().includes("key takeaway");
    blocks.push(
      <ul
        key={`bullets-${blocks.length}`}
        className={`list-disc space-y-1 pl-5 ${
          isKeyTakeaway ? "rounded-xl border border-violet-200 bg-violet-50 p-4 text-violet-900" : "text-slate-700"
        }`}
      >
        {bulletBuffer.map((point, idx) => (
          <li key={`point-${idx}`}>{point}</li>
        ))}
      </ul>
    );
    bulletBuffer = [];
  };

  lines.forEach((line, idx) => {
    const isBullet = /^[-*•]\s+/.test(line) || /^\d+[\).\s]/.test(line);
    const isHeading = /^#{1,3}\s+/.test(line) || /:$/.test(line);

    if (isBullet) {
      bulletBuffer.push(line.replace(/^[-*•]\s+|^\d+[\).\s]+/, ""));
      return;
    }

    flushBullets();
    if (isHeading) {
      activeSection = line.replace(/:$/, "");
      blocks.push(
        <h3
          key={`heading-${idx}`}
          className={`text-base font-semibold ${
            activeSection.toLowerCase().includes("key takeaway") ? "text-violet-700" : "text-slate-900"
          }`}
        >
          {activeSection}
        </h3>
      );
    } else {
      blocks.push(
        <p key={`paragraph-${idx}`} className="text-sm leading-relaxed text-slate-700">
          {line}
        </p>
      );
    }
  });

  flushBullets();
  return blocks;
}

export default function SummaryView({ summary, loading }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
        <div className="animate-pulse space-y-3">
          <div className="h-5 w-1/3 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-200" />
          <div className="h-4 w-11/12 rounded bg-slate-200" />
          <div className="h-4 w-10/12 rounded bg-slate-200" />
        </div>
      </div>
    );
  }

  if (!summary) {
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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Summary</h2>
      <div className="space-y-3">{renderSummary(summary)}</div>
    </div>
  );
}
