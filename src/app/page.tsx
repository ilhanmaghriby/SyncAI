"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ChevronDown,
  Loader2,
  SendHorizonal,
  Sparkles,
  User as UserIcon,
  Bot,
} from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function Home() {
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "model"; content: string }>
  >([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const viewportRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const genAI = useMemo(
    () => new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""),
    []
  );

  // Example prompts
  const examples = useMemo(
    () => [
      "Explain quantum computing in simple terms",
      "Suggest some team-building activities for remote teams",
      "Help me debug this Python code...",
    ],
    []
  );

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    viewportRef.current?.lastElementChild?.scrollIntoView({
      behavior,
      block: "end",
    });
  };

  useEffect(() => {
    if (isAtBottom) scrollToBottom("instant");
  }, [messages, isAtBottom]);

  const onScroll = () => {
    if (!viewportRef.current) return;
    const el = viewportRef.current;
    const atBottom =
      Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 8;
    setIsAtBottom(atBottom);
  };

  const handleExampleClick = (text: string) => {
    setInput(text);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage = { role: "user" as const, content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent([trimmed]);
      const response = await result.response;
      const text = response.text();
      setMessages((prev) => [...prev, { role: "model", content: text }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "model", content: "Maaf, terjadi kesalahan. Coba lagi ya." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 border-b border-slate-200/70">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl overflow-hidden ring-1 ring-slate-200 shadow-sm">
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                className="object-contain bg-white"
              />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 flex items-center gap-2">
                SyncAI <Sparkles className="h-4 w-4 text-indigo-500" />
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Powered by Gemini
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Chat viewport */}
      <main className="flex-1">
        <div
          ref={viewportRef}
          onScroll={onScroll}
          className="mx-auto max-w-4xl px-3 sm:px-6 py-4 sm:py-6 h-[calc(100vh-164px)] overflow-y-auto scroll-smooth"
        >
          {messages.length === 0 ? (
            <EmptyState onPick={handleExampleClick} examples={examples} />
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {messages.map((m, i) => (
                <MessageBubble key={i} role={m.role}>
                  <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:rounded-xl prose-pre:p-3 prose-code:px-1 prose-code:py-0.5 prose-code:bg-slate-100 prose-code:rounded">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.content}
                    </ReactMarkdown>
                  </div>
                </MessageBubble>
              ))}

              {isLoading && (
                <MessageBubble role="model">
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="sr-only">Model is typing</span>
                    <span className="inline-flex gap-1">
                      <Dot />
                      <Dot className="[animation-delay:120ms]" />
                      <Dot className="[animation-delay:240ms]" />
                    </span>
                  </div>
                </MessageBubble>
              )}

              {/* Scroll anchor */}
              <div />
            </div>
          )}
        </div>
      </main>

      {/* Sticky composer */}
      <footer className="sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-4xl px-3 sm:px-6 py-3 sm:py-4">
          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2 sm:gap-3"
          >
            <div className="relative flex-1">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Write your message..."
                className="w-full rounded-2xl sm:rounded-3xl border border-slate-200 bg-white px-4 sm:px-5 py-2.5 sm:py-3 pr-12 shadow-sm outline-none ring-0 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-[15px] text-slate-800 placeholder:text-slate-400"
                disabled={isLoading}
                type="text"
              />
              <div className="pointer-events-none absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-slate-300">
                <SendHorizonal className="h-5 w-5" />
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl sm:rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-4 sm:px-5 py-2.5 sm:py-3 text-sm font-medium shadow-md hover:from-indigo-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SendHorizonal className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Kirim</span>
            </button>
          </form>
          <p className="mt-2 text-center text-[11px] text-slate-500">
            SyncAI may be mistaken. Check important info before use.
          </p>
        </div>

        {!isAtBottom && (
          <button
            onClick={() => scrollToBottom("smooth")}
            className="absolute left-1/2 -translate-x-1/2 -top-4 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-xs text-slate-600 shadow-sm hover:bg-white"
          >
            <ChevronDown className="h-4 w-4" />
            Scroll down
          </button>
        )}
      </footer>
    </div>
  );
}

function MessageBubble({
  role,
  children,
}: {
  role: "user" | "model";
  children: React.ReactNode;
}) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-[85%] sm:max-w-[70%] md:max-w-[60%] items-start gap-2 sm:gap-3 ${
          isUser ? "flex-row-reverse" : ""
        }`}
      >
        <div
          className={`mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-1 ${
            isUser
              ? "bg-gradient-to-br from-indigo-500 to-blue-600 text-white ring-indigo-200"
              : "bg-indigo-50 text-indigo-600 ring-indigo-100"
          }`}
        >
          {isUser ? (
            <UserIcon className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </div>
        <div
          className={`rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 shadow-sm ${
            isUser
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-sm"
              : "bg-white text-slate-800 rounded-bl-sm border border-slate-200"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function Dot({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-2 w-2 rounded-full bg-slate-400 animate-bounce ${className}`}
    />
  );
}

function EmptyState({
  onPick,
  examples,
}: {
  onPick: (t: string) => void;
  examples: string[];
}) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white/80 backdrop-blur p-6 sm:p-8 shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 ring-1 ring-slate-200">
          <Sparkles className="h-7 w-7 text-indigo-500" />
        </div>
        <h2 className="text-center text-2xl font-semibold tracking-tight text-slate-900">
          Welcome to SyncAI
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Ask anything - from creative ideas to technical explanations.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-2.5 text-sm">
          {examples.map((e, i) => (
            <button
              key={i}
              onClick={() => onPick(e)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-left shadow-sm transition hover:border-indigo-300"
            >
              &ldquo;{e}&rdquo;
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
