import Link from "next/link";

const features = [
  {
    title: "OpenRouter API 接入",
    description: "通过后端 API route 统一转发请求，前端不会直接暴露 API Key。",
  },
  {
    title: "AI Chat 测试",
    description: "先做最小可用聊天体验，方便快速验证模型调用和回复展示。",
  },
  {
    title: "未来支持用户余额和 API Token",
    description: "后续可以继续扩展登录、余额、计费和用户自己的调用凭证。",
  },
];

export default function Home() {
  return (
    <main className="min-h-full bg-[#f6f3ee] text-[#1d1c19]">
      <section className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-[#d9d0c4] pb-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7a5c37]">
              MVP Console
            </p>
            <p className="mt-1 text-sm text-[#6d665d]">OpenRouter first</p>
          </div>
          <Link
            href="/chat"
            className="hidden rounded-full border border-[#1d1c19] px-4 py-2 text-sm font-semibold transition hover:bg-[#1d1c19] hover:text-white sm:inline-flex"
          >
            Start Chat
          </Link>
        </header>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.08fr_0.92fr] lg:py-20">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-[#d6cab9] bg-white/55 px-4 py-2 text-sm font-medium text-[#6d665d]">
              简单、可运行、方便继续扩展
            </div>
            <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-normal text-[#171512] sm:text-6xl lg:text-7xl">
              AI Middle Station
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#4f4941] sm:text-xl">
              一个简单的 AI API 中转站 MVP，先从 OpenRouter Chat 开始。
            </p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#6d665d]">
              这个平台第一版会把前端聊天页面和后端模型调用分开：用户只在网页里输入问题，
              服务器负责安全地调用 OpenRouter，再把 AI 回复返回给页面。
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/chat"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#1d1c19] px-6 text-base font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#332f29] focus:outline-none focus:ring-4 focus:ring-[#c7b08e]"
              >
                Start Chat
              </Link>
              <div className="flex min-h-12 items-center rounded-full border border-[#d6cab9] px-5 text-sm font-medium text-[#6d665d]">
                当前阶段：只完成首页 UI
              </div>
            </div>
          </div>

          <div className="rounded-[8px] border border-[#d9d0c4] bg-[#fffaf2] p-4 shadow-[0_24px_80px_rgba(77,62,40,0.12)]">
            <div className="rounded-[6px] border border-[#e4dacd] bg-white">
              <div className="flex items-center justify-between border-b border-[#eee6dc] px-4 py-3">
                <div className="flex gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#e46f55]" />
                  <span className="h-3 w-3 rounded-full bg-[#e3b84e]" />
                  <span className="h-3 w-3 rounded-full bg-[#54a06c]" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a8d7b]">
                  Chat Preview
                </span>
              </div>
              <div className="space-y-4 p-5">
                <div className="max-w-[82%] rounded-[8px] bg-[#f1ece4] px-4 py-3 text-sm leading-6 text-[#4f4941]">
                  帮我用一句话解释这个 AI 中转站。
                </div>
                <div className="ml-auto max-w-[86%] rounded-[8px] bg-[#1d1c19] px-4 py-3 text-sm leading-6 text-white">
                  它是一个把用户问题转发给 AI 模型，并把回复展示回来的轻量入口。
                </div>
                <div className="flex items-center gap-2 rounded-[8px] border border-[#eee6dc] px-4 py-3 text-sm text-[#9a8d7b]">
                  <span className="h-2 w-2 rounded-full bg-[#7a5c37]" />
                  正在准备 Chat 页面
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="grid gap-4 pb-10 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-[8px] border border-[#d9d0c4] bg-white/70 p-5 shadow-sm"
            >
              <h2 className="text-lg font-bold text-[#1d1c19]">
                {feature.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#6d665d]">
                {feature.description}
              </p>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
