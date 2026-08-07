import { createFileRoute } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { assistantReplies, assistantSuggestions } from "@/lib/farm-data";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Farm Assistant — สวนอัจฉริยะ" },
      { name: "description", content: "ถามตอบเรื่องการดูแลพืช ปุ๋ย และสารเคมี กับผู้ช่วย AI ภาษาไทย" },
      { property: "og:title", content: "AI Farm Assistant — สวนอัจฉริยะ" },
      { property: "og:description", content: "ผู้ช่วย AI ตอบคำถามการเกษตรเป็นภาษาไทยตลอด 24 ชม." },
    ],
  }),
  component: AssistantPage,
});

type Msg = { role: "user" | "ai"; text: string };

function AssistantPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "ai",
      text: "สวัสดีครับ ผมคือผู้ช่วยเกษตรอัจฉริยะ 🌱\nถามได้เลยครับ เรื่องโรคพืช ปุ๋ย การให้น้ำ หรือราคาผลผลิต",
    },
  ]);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    const q = text.trim();
    if (!q) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { role: "ai", text: assistantReplies[q] ?? assistantReplies["default"]! },
      ]);
    }, 600);
  };

  return (
    <AppShell title="ผู้ช่วย AI เกษตร" subtitle="ถามตอบภาษาไทย ตลอด 24 ชั่วโมง">
      <div className="space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex gap-2"}>
            {m.role === "ai" ? (
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm">
                🌱
              </span>
            ) : null}
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-line ${
                m.role === "user"
                  ? "gradient-leaf rounded-br-sm text-primary-foreground"
                  : "rounded-bl-sm bg-muted text-foreground"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        {assistantSuggestions.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground/80"
          >
            {s}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="fixed right-0 bottom-20 left-0 z-20 mx-auto flex w-full max-w-md gap-2 px-4"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="พิมพ์คำถามของคุณ…"
          className="flex-1 rounded-full border border-border bg-card px-4 py-3 text-sm shadow-[var(--shadow-card)] outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          aria-label="ส่งข้อความ"
          className="gradient-leaf flex size-12 shrink-0 items-center justify-center rounded-full text-primary-foreground shadow-[var(--shadow-card)]"
        >
          <Send className="size-5" />
        </button>
      </form>
      <div className="h-14" />
    </AppShell>
  );
}