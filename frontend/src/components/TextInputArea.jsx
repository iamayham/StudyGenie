export default function TextInputArea({ value, onChange }) {
  const characterCount = value.length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md transition-shadow duration-200 hover:shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-800">Study Material</label>
        <span className="text-xs text-slate-500">{characterCount} chars</span>
      </div>
      <textarea
        className="min-h-56 w-full rounded-xl border border-slate-300 bg-slate-50 p-4 text-slate-800 shadow-sm transition-all duration-200 placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-100"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste textbook notes, lecture transcript, article, etc..."
      />
      <p className="mt-3 text-sm text-slate-500">Paste notes, lectures, or any study material.</p>
    </div>
  );
}
