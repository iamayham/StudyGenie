export default function OutputDisplay({ title, content, loadingAction }) {
  const hasContent = !!content;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Results</h2>
        {loadingAction && (
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
            Thinking...
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
        <p className="mb-3 text-sm font-semibold text-violet-700">{title}</p>
        <pre className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
          {hasContent ? content : "Your AI-generated response will appear here."}
        </pre>
      </div>
    </section>
  );
}
