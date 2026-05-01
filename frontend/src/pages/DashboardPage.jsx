import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { chatWithContent, getExplanation, getQuiz, getSummary } from "../api/ai";
import ChatView from "../components/ChatView";
import ExplainView from "../components/ExplainView";
import QuizView from "../components/QuizView";
import SummaryView from "../components/SummaryView";

const MODES = [
  { key: "summary", label: "Summary" },
  { key: "quiz", label: "Quiz" },
  { key: "explain", label: "Explain" },
  { key: "chat", label: "Chat" },
];

const getUserStorageScope = () => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser?.id) return parsedUser.id;
    } catch (error) {
      console.error("Failed to parse stored user:", error);
    }
  }

  const persistedUserId = localStorage.getItem("userId");
  if (persistedUserId) return persistedUserId;

  const token = localStorage.getItem("token");
  if (token) {
    try {
      const payloadPart = token.split(".")[1];
      const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
      const payload = JSON.parse(atob(padded));
      if (payload?.id) return payload.id;
      if (payload?.sub) return payload.sub;
    } catch (error) {
      console.error("Failed to parse token payload:", error);
    }
  }

  return localStorage.getItem("userName") || "guest";
};

const createNewChat = () => ({
  id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  title: "New Chat",
  chatMessages: [],
  summary: "",
  explanation: "",
  quizRaw: "",
  quizQuestions: [],
});

const isValidQuizQuestion = (question) =>
  !!question &&
  typeof question.question === "string" &&
  !/answer\s*:/i.test(question.question) &&
  Array.isArray(question.options) &&
  question.options.length === 4 &&
  question.options.every(
    (option) => typeof option === "string" && option.trim() && !/^answer\s*:/i.test(option)
  ) &&
  Number.isInteger(question.correctIndex) &&
  question.correctIndex >= 0 &&
  question.correctIndex < 4;

const normalizeStoredChats = (storedChats) =>
  storedChats.map((chat) => {
    const safeChat = {
      ...createNewChat(),
      ...chat,
    };

    const normalizedQuizQuestions = Array.isArray(safeChat.quizQuestions)
      ? safeChat.quizQuestions.filter(isValidQuizQuestion)
      : [];

    return {
      ...safeChat,
      quizQuestions: normalizedQuizQuestions,
      quizRaw: normalizedQuizQuestions.length ? safeChat.quizRaw : "",
      chatMessages: Array.isArray(safeChat.chatMessages) ? safeChat.chatMessages : [],
    };
  });

const parseQuizQuestions = (quizText) => {
  if (!quizText?.trim()) return [];

  const cleanLine = (line) =>
    line
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/^#+\s*/g, "")
      .trim();

  const rawBlocks = quizText
    .split(/\n(?=\s*(?:\d+[\).\s]|q(?:uestion)?\s*\d*[:.)\s]))/i)
    .map((block) => block.trim())
    .filter(Boolean);

  const parsed = rawBlocks
    .map((block, blockIdx) => {
      const lines = block.split("\n").map((line) => cleanLine(line)).filter(Boolean);
      if (!lines.length) return null;

      const question = lines[0].replace(/^(?:\d+[\).\s]+|q(?:uestion)?\s*\d*[:.)\s]+)/i, "").trim();
      const options = [];
      let correctIndex = -1;

      lines.slice(1).forEach((line) => {
        const optionMatch = line.match(/^([a-d])[\]\).:\-\s]+(.+)$/i);
        const answerMatch = line.match(/^answer\s*[:\-]\s*([a-d]|.+)$/i);

        if (optionMatch) {
          options.push(optionMatch[2].trim());
        } else if (answerMatch) {
          const value = answerMatch[1].trim();
          const letterMatch = value.match(/^[a-d]$/i);
          if (letterMatch) {
            correctIndex = letterMatch[0].toUpperCase().charCodeAt(0) - 65;
          } else {
            const textIndex = options.findIndex(
              (option) => option.toLowerCase() === value.toLowerCase()
            );
            if (textIndex >= 0) correctIndex = textIndex;
          }
        }
      });

      if (!question) return null;
      if (options.length < 2) return null;

      if (correctIndex < 0 || correctIndex >= options.length) {
        correctIndex = 0;
      }

      return {
        id: `q-${blockIdx}-${Math.random().toString(36).slice(2, 7)}`,
        question,
        options,
        correctIndex,
      };
    })
    .filter(Boolean);

  return parsed;
};

function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  onDeleteChat,
  onCreateChat,
  onLogout,
  userName,
  sidebarOpen,
  setSidebarOpen,
  onRenameChat,
  loading,
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const storedUserRaw = localStorage.getItem("user");
  let storedUser = null;

  try {
    storedUser = storedUserRaw ? JSON.parse(storedUserRaw) : null;
  } catch (error) {
    console.error("Failed to parse stored user in sidebar:", error);
  }

  const profileName = storedUser?.name?.trim() || "";
  const profileEmail = storedUser?.email?.trim() || "";
  const profileLabel = profileName || profileEmail || userName;
  const avatarLetter = (profileName || profileEmail || "U").charAt(0).toUpperCase();

  useEffect(() => {
    if (!profileOpen) return undefined;

    const handleOutsideClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [profileOpen]);

  const handleLogoutClick = () => {
    setProfileOpen(false);
    onLogout();
  };

  return (
    <aside
      className={`absolute left-0 top-0 z-30 flex h-full w-[80%] max-w-sm flex-col border-r border-violet-100 bg-white p-4 transition-transform duration-300 ease-out lg:static lg:z-auto lg:h-auto lg:w-80 lg:max-w-none lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="mb-4 flex items-center gap-3">
        <img
          src="/branding/icon-app.png"
          alt="StudyGenie icon"
          className="h-10 w-10 rounded-xl shadow-sm"
        />
        <div>
          <p className="text-lg font-bold text-slate-900">StudyGenie</p>
          <p className="text-xs text-slate-500">{userName}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onCreateChat}
        className="mb-4 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-violet-700 hover:shadow-lg"
      >
        + New Chat
      </button>

      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`flex items-center gap-2 rounded-xl px-2 py-1 transition ${
              chat.id === activeChatId ? "bg-violet-100" : "bg-slate-50 hover:bg-violet-50"
            }`}
          >
            <button
              type="button"
              onClick={() => {
                onSelectChat(chat.id);
                setSidebarOpen(false);
              }}
              className={`min-w-0 flex-1 truncate rounded-lg px-2 py-1.5 text-left text-sm ${
                chat.id === activeChatId ? "font-medium text-violet-700" : "text-slate-600"
              }`}
              title={chat.title}
            >
              {chat.title}
            </button>
            <button
              type="button"
              onClick={() => onDeleteChat(chat.id)}
              disabled={loading}
              className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-rose-600"
              aria-label={`Delete ${chat.title}`}
              title="Delete chat"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => onRenameChat(chat.id)}
              disabled={loading}
              className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-white hover:text-violet-700"
              aria-label={`Rename ${chat.title}`}
              title="Rename chat"
            >
              Rename
            </button>
          </div>
        ))}
      </div>

      {storedUser && (
        <div ref={profileRef} className="relative mt-4">
          <button
            type="button"
            aria-label="Open profile menu"
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex w-full items-center justify-between rounded-xl border border-violet-200 bg-white px-3 py-2.5 text-left transition-all hover:bg-violet-50 hover:shadow-sm"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700">
                {avatarLetter}
              </div>
              <span className="truncate text-sm font-medium text-slate-700">{profileLabel}</span>
            </div>
            <span className="text-xs text-violet-700">{profileOpen ? "▲" : "▼"}</span>
          </button>

          <div
            className={`absolute bottom-14 left-0 right-0 z-20 origin-bottom rounded-xl border border-violet-100 bg-white p-3 shadow-lg transition-all duration-150 ${
              profileOpen
                ? "pointer-events-auto scale-100 opacity-100"
                : "pointer-events-none scale-95 opacity-0"
            }`}
          >
            <div className="space-y-1 pb-2">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4 text-violet-700"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 21a8 8 0 10-16 0M12 11a4 4 0 100-8 4 4 0 000 8z" />
                </svg>
                <span>{profileName || "User"}</span>
              </p>
              <p className="flex items-center gap-1.5 truncate text-xs text-slate-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4 shrink-0 text-violet-700"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l9 6 9-6" />
                </svg>
                <span className="truncate">{profileEmail || "No email"}</span>
              </p>
            </div>
            <div className="my-2 h-px bg-slate-200" />
            <button
              type="button"
              onClick={handleLogoutClick}
              className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-violet-700 transition hover:bg-violet-50"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

function ChatBubble({ message }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {!isUser && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-semibold text-violet-700">
            SG
          </div>
        )}
        <div
          className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
            isUser ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-800"
          }`}
        >
          {message.content}
          {!isUser && (
            <button
              type="button"
              onClick={handleCopy}
              className="mt-2 block rounded-md bg-white px-2 py-1 text-xs font-medium text-violet-700 transition-all hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ModeSelector({ mode, onChange, loading }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Mode</span>
      <div className="inline-flex flex-wrap rounded-full border border-violet-200 bg-white p-1">
        {MODES.map((item) => (
          <button
            key={item.key}
            type="button"
            disabled={loading}
            onClick={() => onChange(item.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50 ${
              mode === item.key
                ? "bg-violet-600 text-white shadow-sm"
                : "text-violet-700 hover:bg-violet-50 hover:shadow-sm"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ChatComposer({ mode, input, onInputChange, onSend, loading }) {
  return (
    <div className="border-t border-violet-100 bg-white p-4 md:px-8">
      <div className="mx-auto max-w-4xl">
        <ModeSelector mode={mode} onChange={onInputChange.mode} loading={loading} />
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => onInputChange.text(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!loading) onSend();
              }
            }}
            rows={2}
            disabled={loading}
            placeholder={
              mode === "summary"
                ? "Paste content to summarize..."
                : mode === "quiz"
                  ? "Paste content to generate a quiz..."
                  : mode === "explain"
                    ? "Paste a topic you want explained..."
                    : "Ask StudyGenie anything..."
            }
            className="w-full resize-none rounded-2xl border border-slate-300 bg-slate-50 py-3 pl-4 pr-20 text-sm text-slate-800 transition focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="button"
            onClick={onSend}
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-violet-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const userName = (() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed?.name) return parsed.name;
      }
    } catch (error) {
      console.error("Failed to read stored user name:", error);
    }
    return localStorage.getItem("userName") || "Learner";
  })();
  const userStorageScope = useMemo(() => getUserStorageScope(), []);
  const storageKeys = useMemo(
    () => ({
      chats: `studygenie_chats_${userStorageScope}`,
      activeChatId: `studygenie_active_chat_id_${userStorageScope}`,
      mode: `studygenie_mode_${userStorageScope}`,
    }),
    [userStorageScope]
  );

  const [mode, setMode] = useState("summary");
  const [input, setInput] = useState("");
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isStorageReady, setIsStorageReady] = useState(false);
  const messagesEndRef = useRef(null);

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId) || chats[0],
    [chats, activeChatId]
  );

  const getChatsFromStorage = () => {
    const candidateKeys = [
      storageKeys.chats,
      // Legacy unscoped key used in earlier builds.
      "studygenie_chats",
      // Legacy username-scoped key fallback.
      `studygenie_chats_${userName}`,
    ];

    for (const key of candidateKeys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Migrate legacy key data into current user-scoped key.
          if (key !== storageKeys.chats) {
            localStorage.setItem(storageKeys.chats, raw);
          }
          return normalizeStoredChats(parsed);
        }
      } catch (error) {
        console.error(`Failed to parse chats from key ${key}:`, error);
      }
    }

    return [];
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeChat?.chatMessages, activeChat?.summary, activeChat?.explanation, activeChat?.quizRaw, loadingAction]);

  useEffect(() => {
    setIsStorageReady(false);
    try {
      const nextChats = getChatsFromStorage();
      setChats(nextChats);

      const savedActiveChatId = localStorage.getItem(storageKeys.activeChatId) || "";
      setActiveChatId(savedActiveChatId);

      const savedMode = localStorage.getItem(storageKeys.mode) || "summary";
      setMode(savedMode);
      setInput("");
      setError("");
    } catch (error) {
      console.error("Failed to restore user-scoped chat state:", error);
      setChats([]);
      setActiveChatId("");
      setMode("summary");
    } finally {
      setIsStorageReady(true);
    }
  }, [storageKeys]);

  useEffect(() => {
    if (!isStorageReady) return;
    localStorage.setItem(storageKeys.chats, JSON.stringify(chats));
  }, [chats, storageKeys, isStorageReady]);

  useEffect(() => {
    if (!isStorageReady) return;
    if (activeChatId) {
      localStorage.setItem(storageKeys.activeChatId, activeChatId);
    }
  }, [activeChatId, storageKeys, isStorageReady]);

  useEffect(() => {
    if (!isStorageReady) return;
    localStorage.setItem(storageKeys.mode, mode);
  }, [mode, storageKeys, isStorageReady]);

  useEffect(() => {
    if (!activeChat || !chats.length) {
      setActiveChatId(chats[0]?.id || "");
    }
  }, [activeChat, chats]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const createChat = () => {
    const newChat = createNewChat();
    setChats((prev) => [...prev, newChat]);
    setActiveChatId(newChat.id);
    setError("");
  };

  const renameChat = (chatId) => {
    const target = chats.find((chat) => chat.id === chatId);
    if (!target) return;
    const nextTitle = window.prompt("Rename chat", target.title);
    if (!nextTitle?.trim()) return;
    setChats((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, title: nextTitle.trim() } : chat))
    );
  };

  const deleteChat = (chatId) => {
    setChats((prev) => {
      const filtered = prev.filter((chat) => chat.id !== chatId);
      if (chatId === activeChatId) {
        setActiveChatId(filtered[0]?.id || "");
      }
      return filtered;
    });
  };

  const clearConversation = () => {
    if (!activeChat) return;
    updateChatData(activeChat.id, (chat) => ({
      ...chat,
      chatMessages: [],
      summary: "",
      explanation: "",
      quizRaw: "",
      quizQuestions: [],
    }));
  };

  const updateChatMessages = (chatId, updater) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== chatId) return chat;
        const updatedMessages = updater(chat.chatMessages);
        const firstUserMessage = updatedMessages.find((message) => message.role === "user");
        return {
          ...chat,
          chatMessages: updatedMessages,
          title: firstUserMessage ? firstUserMessage.content.slice(0, 28) : chat.title,
        };
      })
    );
  };

  const updateChatData = (chatId, updater) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== chatId) return chat;
        return updater(chat);
      })
    );
  };

  const sendMessage = async () => {
    if (!input.trim()) {
      setError("Please type a message first.");
      return;
    }

    const userText = input.trim();
    let chatId = activeChat?.id;
    if (!chatId) {
      const newChat = createNewChat();
      setChats((prev) => [...prev, newChat]);
      setActiveChatId(newChat.id);
      chatId = newChat.id;
    }
    setError("");
    setLoadingAction(true);
    setInput("");
    if (mode === "chat") {
      updateChatMessages(chatId, (prevMessages) => [
        ...prevMessages,
        { id: crypto.randomUUID(), role: "user", content: userText, mode },
      ]);
    }

    try {
      let responseText = "";
      if (mode === "summary") {
        const data = await getSummary(userText);
        responseText = data.summary;
        updateChatData(chatId, (chat) => ({
          ...chat,
          summary: responseText,
          title: userText.slice(0, 28) || chat.title,
        }));
      } else if (mode === "quiz") {
        const data = await getQuiz(userText);
        responseText = data.quiz;
        updateChatData(chatId, (chat) => ({
          ...chat,
          quizRaw: responseText,
          quizQuestions: parseQuizQuestions(responseText),
          title: userText.slice(0, 28) || chat.title,
        }));
      } else if (mode === "explain") {
        const data = await getExplanation(userText);
        responseText = data.explanation;
        updateChatData(chatId, (chat) => ({
          ...chat,
          explanation: responseText,
          title: userText.slice(0, 28) || chat.title,
        }));
      } else {
        const context = activeChat.chatMessages
          .map((message) => message.content)
          .join("\n\n");
        const data = await chatWithContent(context || userText, userText);
        responseText = data.answer;
        updateChatMessages(chatId, (prevMessages) => [
          ...prevMessages,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: responseText,
            mode,
          },
        ]);
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="flex h-screen overflow-x-hidden bg-slate-100">
      <div className={`fixed inset-0 z-30 lg:hidden ${sidebarOpen ? "" : "pointer-events-none"}`}>
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
            sidebarOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={setActiveChatId}
          onDeleteChat={deleteChat}
          onRenameChat={renameChat}
          onCreateChat={createChat}
          onLogout={handleLogout}
          userName={userName}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          loading={loadingAction}
        />
      </div>

      <div className="hidden lg:block">
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={setActiveChatId}
          onDeleteChat={deleteChat}
          onRenameChat={renameChat}
          onCreateChat={createChat}
          onLogout={handleLogout}
          userName={userName}
          sidebarOpen
          setSidebarOpen={setSidebarOpen}
          loading={loadingAction}
        />
      </div>

      <main className="flex min-w-0 flex-1 flex-col bg-gradient-to-b from-violet-50 via-white to-slate-50">
        <div className="px-4 pt-4 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            className="inline-flex items-center rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm font-medium text-violet-700 shadow-sm"
          >
            ☰
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 pb-36 md:px-6 md:py-5 lg:px-8 lg:py-6">
          <div className="flex items-center justify-between">
            {loadingAction ? (
              <p className="text-sm font-medium text-violet-700">StudyGenie is thinking...</p>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={clearConversation}
              disabled={loadingAction || !activeChat}
              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition-all hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear conversation
            </button>
          </div>
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
              {error}
            </p>
          )}

          {mode === "summary" && (
            <SummaryView
              summary={activeChat?.summary || ""}
              loading={loadingAction}
            />
          )}
          {mode === "quiz" && (
            <QuizView
              questions={activeChat?.quizQuestions || []}
              loading={loadingAction}
            />
          )}
          {mode === "explain" && (
            <ExplainView
              explanation={activeChat?.explanation || ""}
              loading={loadingAction}
            />
          )}
          {mode === "chat" && (
            <ChatView
              messages={activeChat?.chatMessages || []}
              loading={loadingAction}
              renderBubble={(message) => <ChatBubble key={message.id} message={message} />}
            />
          )}
          <div ref={messagesEndRef} />
        </div>

        <ChatComposer
          mode={mode}
          input={input}
          loading={loadingAction}
          onSend={sendMessage}
          onInputChange={{ text: setInput, mode: setMode }}
        />
      </main>
    </div>
  );
}
