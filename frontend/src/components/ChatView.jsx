export default function ChatView({ messages, loading, renderBubble }) {
  if (!messages.length) {
    return (
      <div className="flex h-full min-h-80 items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-600">
            ✨
          </div>
          <p className="text-sm text-slate-500">Start by asking something ✨</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => renderBubble(message))}
      {loading && (
        <div className="flex justify-start">
          <div className="flex items-end gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">
              SG
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-600 shadow-sm">
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-violet-500 [animation-delay:-0.2s]" />
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-violet-500 [animation-delay:-0.1s]" />
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-violet-500" />
              StudyGenie is typing...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
