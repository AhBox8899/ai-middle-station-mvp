type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type ChatRequestBody = {
  messages?: ChatMessage[];
  model?: string;
};

type OpenRouterChoice = {
  message?: {
    content?: string;
  };
};

type OpenRouterResponse = {
  choices?: OpenRouterChoice[];
  error?: {
    message?: string;
  };
};

const defaultModel = "openai/gpt-4o-mini";
const maxMessageLength = 2000;
const rateLimitWindowMs = 60 * 1000;
const rateLimitMaxRequests = 10;
const allowedModels = [
  defaultModel,
  "anthropic/claude-3-haiku",
  "deepseek/deepseek-chat",
  "google/gemini-2.0-flash-001",
] as const;

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const current = rateLimitStore.get(ip);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(ip, {
      count: 1,
      resetAt: now + rateLimitWindowMs,
    });
    return false;
  }

  if (current.count >= rateLimitMaxRequests) {
    return true;
  }

  current.count += 1;
  return false;
}

function getOpenRouterErrorMessage(status: number) {
  if (status === 401) {
    return "API authentication failed.";
  }

  if (status === 402) {
    return "API balance may be insufficient.";
  }

  if (status === 429) {
    return "Model is busy. Please try again later.";
  }

  if (status >= 500) {
    return "AI service temporarily unavailable.";
  }

  return "Chat request failed. Please try again.";
}

function isValidMessage(message: unknown): message is ChatMessage {
  if (!message || typeof message !== "object") {
    return false;
  }

  const candidate = message as Partial<ChatMessage>;
  return (
    (candidate.role === "system" ||
      candidate.role === "user" ||
      candidate.role === "assistant") &&
    typeof candidate.content === "string" &&
    candidate.content.trim().length > 0
  );
}

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  if (isRateLimited(clientIp)) {
    return Response.json(
      { error: "Too many requests. Please slow down." },
      { status: 429 },
    );
  }

  let body: ChatRequestBody;

  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return Response.json(
      { error: "Invalid JSON body. Please send messages as JSON." },
      { status: 400 },
    );
  }

  const messages = body.messages;
  const model = body.model || defaultModel;

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json(
      { error: "messages is required and must be a non-empty array." },
      { status: 400 },
    );
  }

  if (!messages.every(isValidMessage)) {
    return Response.json(
      {
        error:
          "Each message must include role and non-empty content. Role must be system, user, or assistant.",
      },
      { status: 400 },
    );
  }

  if (messages.some((message) => message.content.length > maxMessageLength)) {
    return Response.json({ error: "Message is too long." }, { status: 400 });
  }

  if (!allowedModels.includes(model as (typeof allowedModels)[number])) {
    return Response.json(
      { error: "Selected model is not supported." },
      { status: 400 },
    );
  }

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return Response.json(
      {
        error:
          "OPENROUTER_API_KEY is missing. Please set it in .env.local and restart the dev server.",
      },
      { status: 500 },
    );
  }

  try {
    const openRouterResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
        }),
      },
    );

    const data = (await openRouterResponse.json()) as OpenRouterResponse;

    if (!openRouterResponse.ok) {
      return Response.json(
        {
          error: getOpenRouterErrorMessage(openRouterResponse.status),
        },
        { status: openRouterResponse.status },
      );
    }

    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return Response.json(
        { error: "OpenRouter did not return a reply." },
        { status: 502 },
      );
    }

    return Response.json({ reply });
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "Unknown connection error";

    return Response.json(
      {
        error: `Failed to connect to OpenRouter: ${detail}`,
      },
      { status: 502 },
    );
  }
}
