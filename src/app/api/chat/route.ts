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
const allowedModels = [
  defaultModel,
  "anthropic/claude-3-haiku",
  "deepseek/deepseek-chat",
  "google/gemini-flash-1.5",
] as const;

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
          error:
            data.error?.message ||
            `OpenRouter request failed with status ${openRouterResponse.status}.`,
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
