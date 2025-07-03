"use client";
import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function Home() {
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string }>
  >([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Inisialisasi Gemini dengan API Key
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

  // Markdown parser sederhana
  const parseMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold
      .replace(/\*(.*?)\*/g, "<em>$1</em>") // Italic
      .replace(/`([^`]+)`/g, "<code>$1</code>") // Inline code
      .replace(/\n/g, "<br/>"); // Line break
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent([input]);
      const response = await result.response;
      const text = response.text();
      setMessages((prev) => [...prev, { role: "model", content: text }]);
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center">
          <div className="w-10 h-10 mr-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-full h-full object-contain rounded-full bg-white p-1 shadow-md"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">SyncAI</h1>
            <p className="text-xs text-gray-500">Powered by Gemini</p>
          </div>
        </div>
      </header>

      {/* Chat container */}
      <div className="flex-1 overflow-y-auto p-4 pb-20 max-w-4xl w-full mx-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-center max-w-md p-6 rounded-xl bg-white/50 backdrop-blur-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-indigo-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-gray-700">
                Welcome to SyncAI
              </h2>
              <p className="text-gray-600 mb-4">
                Start chatting with our AI assistant powered by Gemini.
              </p>
              <div className="text-xs text-gray-400">
                <p>Try asking:</p>
                <p className="mt-1">
                  "Explain quantum computing in simple terms"
                </p>
                <p>or</p>
                <p>"What's the weather like today?"</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-3/4 rounded-xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 shadow-sm rounded-bl-none"
                  }`}
                >
                  {message.role === "model" && (
                    <div className="flex items-center mb-1">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 mr-2 flex items-center justify-center">
                        <svg
                          className="h-4 w-4 text-indigo-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-indigo-600">
                        SyncAI
                      </span>
                    </div>
                  )}
                  <div
                    className="whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html:
                        message.role === "model"
                          ? parseMarkdown(message.content)
                          : message.content,
                    }}
                  />
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 rounded-xl px-4 py-3 shadow-sm rounded-bl-none max-w-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                      <svg
                        className="h-4 w-4 text-indigo-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                      <div
                        className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input form */}
      <div className="bg-white border-t border-gray-200 py-4 px-6 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-3 rounded-full hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 shadow-md flex items-center justify-center"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            SyncAI can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  );
}
