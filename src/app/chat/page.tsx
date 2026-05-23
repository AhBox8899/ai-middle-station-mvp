"use client";

import Link from "next/link";
import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

const models = [
  {
    id: "openai/gpt-4o-mini",
    label: "GPT-4o Mini",
  },
  {
    id: "anthropic/claude-3-haiku",
    label: "Claude 3 Haiku",
  },
  {
    id: "deepseek/deepseek-chat",
    label: "DeepSeek Chat",
  },
  {
    id: "google/gemini-2.0-flash-001",
    label: "Gemini 2.0 Flash",
  },
] as const;

const defaultModel = "openai/gpt-4o-mini";

const welcomeMessage: Message = {
  id: 1,
  role: "assistant",
  content:
    "Hi, this is the AI Chat Test page. Send a message to call OpenRouter through /api/chat.",
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState(defaultModel);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const canSend = useMemo(
    () => input.trim().length > 0 && !isLoading,
    [input, isLoading],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, error]);

  async function sendMessage() {
    const userContent = input.trim();
    if (!userContent || isLoading) {
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: userContent,
    };

    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput("");
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: nextMessages
            .filter((message) => message.id !== 1)
            .map(({ role, content }) => ({
              role,
              content,
            })),
        }),
      });

      const data = (await response.json()) as {
        reply?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || `Chat request failed: ${response.status}`);
      }

      if (!data.reply) {
        throw new Error("API did not return a reply.");
      }

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.reply,
      };

      setMessages((currentMessages) => [
        ...currentMessages,
        assistantMessage,
      ]);
    } catch (requestError) {
      console.error("Chat request failed", requestError);
      setError(
        "Sorry, the chat request failed. Please check your API key or try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  function handleClearChat() {
    if (isLoading) {
      return;
    }

    setMessages([welcomeMessage]);
    setInput("");
    setError("");
  }

  return (
    <main className="min-h-full bg-[#f7f7f5] text-[#202123]">
      <section className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-[#deded8] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5f6460]">
              AI Middle Station
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal text-[#202123] sm:text-4xl">
              AI Chat Test
            </h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleClearChat}
              disabled={isLoading}
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#c9c9c3] px-5 text-sm font-semibold text-[#343541] transition hover:border-[#202123] hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear Chat
            </button>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#202123] px-5 text-sm font-semibold text-white transition hover:bg-[#343541]"
            >
              Back Home
            </Link>
          </div>
        </header>

        <div className="flex flex-1 flex-col py-6">
          <div className="flex min-h-[68vh] flex-1 flex-col overflow-hidden rounded-[8px] border border-[#deded8] bg-white shadow-[0_22px_70px_rgba(32,33,35,0.10)]">
            <div className="flex items-center justify-between border-b border-[#ececea] bg-white px-4 py-3 sm:px-5">
              <div>
                <p className="text-sm font-bold text-[#202123]">Live Chat</p>
                <p className="mt-1 text-xs text-[#6f736f]">
                  Calls /api/chat while keeping the API Key on the server
                </p>
              </div>
              <span className="rounded-full bg-[#eef2ee] px-3 py-1 text-xs font-semibold text-[#4b5b50]">
                OpenRouter
              </span>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto bg-[#fbfbfa] px-4 py-5 sm:px-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-[8px] px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[74%] ${
                      message.role === "user"
                        ? "bg-[#202123] text-white"
                        : "border border-[#ececea] bg-white text-[#2f302f]"
                    }`}
                  >
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] opacity-65">
                      {message.role === "user" ? "User" : "AI"}
                    </p>
                    <p className="whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-[8px] border border-[#ececea] bg-white px-4 py-3 text-sm text-[#5f6460] shadow-sm">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] opacity-65">
                      AI
                    </p>
                    Thinking...
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-[8px] border border-[#f0c7bc] bg-[#fff4f1] px-4 py-3 text-sm leading-6 text-[#8b3222]">
                  {error}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={handleSubmit}
              className="border-t border-[#ececea] bg-white p-3 sm:p-4"
            >
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <label
                  htmlFor="model"
                  className="text-xs font-semibold uppercase tracking-[0.12em] text-[#6f736f]"
                >
                  Model
                </label>
                <select
                  id="model"
                  value={selectedModel}
                  onChange={(event) => setSelectedModel(event.target.value)}
                  disabled={isLoading}
                  className="h-10 rounded-[8px] border border-[#d6d6d0] bg-[#fbfbfa] px-3 text-sm font-medium text-[#202123] outline-none transition focus:border-[#8f9a92] focus:ring-4 focus:ring-[#e6ebe7] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.label} - {model.id}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything..."
                  rows={1}
                  className="min-h-12 flex-1 resize-none rounded-[8px] border border-[#d6d6d0] bg-[#fbfbfa] px-4 py-3 text-base leading-6 text-[#202123] outline-none transition placeholder:text-[#8d918d] focus:border-[#8f9a92] focus:ring-4 focus:ring-[#e6ebe7]"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!canSend}
                  className="h-12 rounded-[8px] bg-[#202123] px-7 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#343541] focus:outline-none focus:ring-4 focus:ring-[#d5ddd7] disabled:cursor-not-allowed disabled:bg-[#b8bbb8] disabled:hover:translate-y-0"
                >
                  {isLoading ? "Sending..." : "Send"}
                </button>
              </div>
              <p className="mt-2 text-xs text-[#777b77]">
                Press Enter to send. Press Shift + Enter for a new line.
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
