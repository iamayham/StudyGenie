import LoadingState from "./LoadingState";

const isBulletLine = (line) => /^[-*]\s+/.test(line);
const isHeadingLine = (line) => /^#{1,3}\s+/.test(line);

function renderStructuredContent(content) {
  const lines = content.split("\n");
  const blocks = [];
  let paragraphBuffer = [];
  let bulletBuffer = [];

  const flushParagraph = () => {
    if (!paragraphBuffer.length) return;
    blocks.push(
      <p key={`p-${blocks.length}`} className="leading-relaxed text-slate-800">
        {paragraphBuffer.join(" ")}
      </p>
    );
    paragraphBuffer = [];
  };

  const flushBullets = () => {
    if (!bulletBuffer.length) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="list-disc space-y-1 pl-5 text-slate-800">
        {bulletBuffer.map((item, idx) => (
          <li key={`li-${idx}`} className="leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    );
    bulletBuffer = [];
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();
    if (!line) {
      flushParagraph();
      flushBullets();
      return;
    }

    if (isHeadingLine(line)) {
      flushParagraph();
      flushBullets();
      const level = line.match(/^#{1,3}/)?.[0]?.length || 1;
      const headingText = line.replace(/^#{1,3}\s+/, "");
      const className =
        level === 1
          ? "text-xl font-semibold text-slate-900"
          : level === 2
            ? "text-lg font-semibold text-slate-900"
            : "text-base font-semibold text-slate-900";
      blocks.push(
        <h3 key={`h-${idx}`} className={className}>
          {headingText}
        </h3>
      );
      return;
    }

    if (isBulletLine(line)) {
      flushParagraph();
      bulletBuffer.push(line.replace(/^[-*]\s+/, ""));
      return;
    }

    flushBullets();
    paragraphBuffer.push(line);
  });

  flushParagraph();
  flushBullets();

  return blocks;
}

export default function OutputCard({ title, content, loadingAction }) {
  const hasContent = !!content.trim();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition-all duration-300 hover:shadow-lg md:p-8">
      <div className="mb-5 flex items-center justify-between">
        <div className="inline-flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
            ✨
          </span>
          <h2 className="text-lg font-semibold text-slate-900">Results</h2>
        </div>
        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
          {title}
        </span>
      </div>

      <div className="rounded-xl border border-slate-100 bg-slate-50 p-5 transition-opacity duration-300">
        {loadingAction ? (
          // Skeleton state keeps the layout stable while results are generated.
          <LoadingState />
        ) : hasContent ? (
          // Render lightweight structured text so headings and bullets are easier to scan.
          <div className="space-y-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
            {renderStructuredContent(content)}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-xl text-slate-600">
              🧠
            </span>
            <p className="text-sm text-slate-600">No output yet. Generate something to see results.</p>
          </div>
        )}
      </div>
    </section>
  );
}
