import Anthropic from "@anthropic-ai/sdk";
import { agentTools, validateAction } from "@/lib/agent/tools";
import { systemPrompt } from "@/lib/agent/system-prompt";
import { checkRateLimit } from "@/lib/ratelimit";

/**
 * POST /api/chat — streams the agent's answer as NDJSON lines:
 *   {"t":"text","v":"…"}       text delta
 *   {"t":"action","a":{…}}     a UI action for the browser to run (whitelisted)
 *   {"t":"error","code":"…"}   refusal | busy | server
 *   {"t":"done","actions":n}
 */

const MODEL = "claude-haiku-5-5";
const MAX_MESSAGES = 12;
const MAX_INPUT = 500;
const MAX_ASSISTANT = 3000;
const MAX_ACTIONS = 3;
const MAX_TURNS = MAX_ACTIONS + 1;

type Incoming = { role: "user" | "assistant"; content: string };

function parseBody(body: unknown): Incoming[] | null {
  const msgs = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(msgs) || msgs.length === 0 || msgs.length > MAX_MESSAGES) return null;
  const out: Incoming[] = [];
  for (let i = 0; i < msgs.length; i++) {
    const m = msgs[i] as Partial<Incoming>;
    const expected = i % 2 === 0 ? "user" : "assistant";
    if (m?.role !== expected || typeof m.content !== "string") return null;
    const content = m.content.trim();
    if (!content) return null;
    if (m.role === "user" && content.length > MAX_INPUT) return null;
    out.push({ role: m.role, content: content.slice(0, MAX_ASSISTANT) });
  }
  return out[out.length - 1].role === "user" ? out : null;
}

const json = (status: number, error: string) =>
  new Response(JSON.stringify({ error }), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

export async function POST(req: Request) {
  if (!process.env.ANTHROPIC_API_KEY) return json(503, "offline");

  let messages: Incoming[] | null = null;
  try {
    messages = parseBody(await req.json());
  } catch {
    messages = null;
  }
  if (!messages) return json(400, "invalid");

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "anon";
  const rl = await checkRateLimit(ip);
  if (!rl.ok) return json(429, "rate");

  const client = new Anthropic();
  const tools = agentTools();
  const system: Anthropic.TextBlockParam[] = [{ type: "text", text: systemPrompt(), cache_control: { type: "ephemeral" } }];
  const convo: Anthropic.MessageParam[] = messages.map((m) => ({ role: m.role, content: m.content }));
  const encoder = new TextEncoder();

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      let actions = 0;
      let jsonRetries = 0;
      try {
        for (let turn = 0; turn < MAX_TURNS; turn++) {
          const stream = client.messages.stream(
            {
              model: MODEL,
              max_tokens: 400,
              system,
              tools,
              tool_choice: actions >= MAX_ACTIONS ? { type: "none" } : { type: "auto" },
              output_config: { effort: "low" },
              messages: convo,
            },
            { signal: req.signal },
          );
          stream.on("text", (delta) => send({ t: "text", v: delta }));

          let message: Anthropic.Message;
          try {
            message = await stream.finalMessage();
            jsonRetries = 0;
          } catch (err) {
            // Only an unparseable tool input is retried (eager input streaming); API errors propagate.
            if (err instanceof Anthropic.APIError || req.signal.aborted || jsonRetries++ >= 1) throw err;
            continue;
          }

          if (message.stop_reason === "refusal") {
            send({ t: "error", code: "refusal" });
            break;
          }
          const uses = message.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
          if (uses.length === 0) break;
          // A tool input cut off at max_tokens can still look valid: never run it.
          if (message.stop_reason === "max_tokens") break;

          convo.push({ role: "assistant", content: message.content });
          const results: Anthropic.ToolResultBlockParam[] = uses.map((use) => {
            if (actions >= MAX_ACTIONS) {
              return { type: "tool_result", tool_use_id: use.id, is_error: true, content: "Action limit reached for this answer." };
            }
            const v = validateAction(use.name, use.input);
            if (!v.ok) return { type: "tool_result", tool_use_id: use.id, is_error: true, content: v.error };
            actions++;
            send({ t: "action", a: v.action });
            return { type: "tool_result", tool_use_id: use.id, content: "Done: the page shows it now." };
          });
          convo.push({ role: "user", content: results });
        }
        send({ t: "done", actions });
      } catch (err) {
        if (!req.signal.aborted) {
          send({ t: "error", code: err instanceof Anthropic.RateLimitError || err instanceof Anthropic.InternalServerError ? "busy" : "server" });
          if (!(err instanceof Anthropic.APIError)) console.error("chat stream failed", err);
        }
      } finally {
        try {
          controller.close();
        } catch {}
      }
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
  });
}
